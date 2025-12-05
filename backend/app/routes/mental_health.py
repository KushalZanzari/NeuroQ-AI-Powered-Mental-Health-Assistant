from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
from ..routes.auth import get_current_user

load_dotenv()

router = APIRouter(prefix="/predict")

class PredictRequest(BaseModel):
    thoughts: str
    symptoms: list
    mood: int
    sleep_hours: float
    stress_level: int


@router.post("/")
def analyze_mental_health(data: PredictRequest, user=Depends(get_current_user)):

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(500, "Groq Key Missing")

    try:
        client = Groq(api_key=api_key)

        prompt = f"""
You are a certified mental health specialist AI.
Analyze the following user's mental state and return a structured response.

User Thoughts:
{data.thoughts}

Symptoms:
{", ".join(data.symptoms)}

Overall Mood (1-10): {data.mood}
Sleep Hours: {data.sleep_hours}
Stress Level (1-10): {data.stress_level}

Respond ONLY in JSON:

{{
  "predicted_disorder": "...",
  "confidence_score": 0.0,
  "severity_level": "...",
  "recommendations": "...",
  "next_steps": "1. ... 2. ... 3. ...",
  "emergency_contact_suggested": true/false
}}
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.3
        )

        result_text = response.choices[0].message.content

        import json
        result_json = json.loads(result_text)

        return result_json

    except Exception as e:
        print("Groq Error:", e)
        raise HTTPException(500, "AI Prediction Failed")
