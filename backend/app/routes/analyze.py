# app/routes/analyze.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import os
import json
from ..routes.auth import get_current_user

load_dotenv()

router = APIRouter()

# Request model - match your frontend form shape
class SymptomRequest(BaseModel):
    text: str
    symptoms: List[str] = []
    overall_mood: Optional[int] = None    # 1..10
    sleep_hours: Optional[float] = None
    stress_level: Optional[int] = None    # 1..10

# Response model (you can make it pydantic if needed)
# We'll return a dict with:
# predicted_disorder, confidence_score (0..1), severity_level, recommendations, next_steps, emergency_contact_suggested

# Heuristic fallback generator (used if GROQ key not present or API fails)
def heuristic_analysis(payload: SymptomRequest):
    score = 0.0
    # base score from number of symptoms
    score += min(len(payload.symptoms) * 0.12, 0.6)
    # stress increases likelihood
    if payload.stress_level:
        score += (payload.stress_level / 10.0) * 0.3
    # low mood boosts score
    if payload.overall_mood is not None:
        score += max(0.0, (6 - payload.overall_mood) / 10.0) * 0.2

    # clamp
    confidence = max(0.05, min(score, 0.98))
    # simple label selection
    if "panic attacks" in [s.lower() for s in payload.symptoms] or (payload.stress_level and payload.stress_level >= 8):
        disorder = "Panic / Anxiety"
        severity = "severe" if confidence > 0.7 else "moderate"
    elif "depression" in " ".join(payload.symptoms).lower() or (payload.overall_mood and payload.overall_mood <= 3):
        disorder = "Depression"
        severity = "moderate" if confidence > 0.5 else "mild"
    elif len(payload.symptoms) == 0:
        disorder = "No disorder detected"
        severity = "mild"
    else:
        disorder = "Anxiety"
        severity = "moderate"

    recommendations = (
        "Try relaxation techniques (deep breathing, short mindful breaks), improve sleep hygiene, "
        "and consider speaking with a mental health professional if symptoms persist."
    )
    next_steps = "1. Practice relaxation  2. Keep sleep schedule  3. Track symptoms for a week  4. Consider professional help"
    emergency = True if (payload.stress_level and payload.stress_level >= 9) or ("self-harm" in payload.text.lower()) else False

    return {
        "predicted_disorder": disorder,
        "confidence_score": round(confidence, 2),
        "severity_level": severity,
        "recommendations": recommendations,
        "next_steps": next_steps,
        "emergency_contact_suggested": emergency
    }

@router.post("/")
def analyze_symptoms(payload: SymptomRequest, user=Depends(get_current_user)):
    api_key = os.getenv("GROQ_API_KEY")
    # If no GROQ key, fallback quickly to heuristic (so results vary)
    if not api_key:
        return heuristic_analysis(payload)

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        # Build a concise system prompt instructing the model to output JSON only.
        system_prompt = (
            "You are a clinical-assistant style model that MUST return a single valid JSON object (no extra text). "
            "Given the user's symptom data, produce a JSON with the keys: "
            "predicted_disorder (short string), confidence_score (0..1), severity_level ('mild'/'moderate'/'severe'), "
            "recommendations (string), next_steps (string), emergency_contact_suggested (true/false)."
            "Be concise and consistent."
        )

        # Compose the user content including payload
        user_content = f"""
User text: {payload.text}
Symptoms: {', '.join(payload.symptoms)}
Overall mood (1-10): {payload.overall_mood}
Hours sleep: {payload.sleep_hours}
Stress level (1-10): {payload.stress_level}
Return ONLY JSON.
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
             messages=[
                {"role": "system", "content": (
                "You are an AI mental-health assistant. Base your analysis ONLY on the "
                "user's inputs. Different symptoms MUST produce different outputs. "
                "Return ONLY a valid JSON object with: predicted_disorder, confidence_score, "
                "severity_level, recommendations, next_steps, emergency_contact_suggested."
                )},
                {"role": "user", "content": f"""
                User text: {payload.text}
                Symptoms: {', '.join(payload.symptoms)}
                Overall mood: {payload.overall_mood}
                Sleep hours: {payload.sleep_hours}
                Stress level: {payload.stress_level}

                RULES:
                - More symptoms = more severe.
                - Stress ≥ 8 → high severity.
                - Mood ≤ 3 → depression indicator.
                - Panic attacks strongly increase panic/anxiety.
                - Sleep < 5 increases depression/anxiety.
                - No symptoms → return 'No disorder'.

                Return ONLY JSON. """},
            ],
            max_tokens=300,
            temperature=0.75,
            top_p=0.95,
        )

        # Response text may be in response.choices[0].message.content or similar depending on SDK:
        # Try a few common shapes
        raw = None
        try:
            raw = response.choices[0].message.content
        except Exception:
            try:
                raw = response.choices[0].text
            except Exception:
                raw = str(response)

        # The model should have returned JSON — try to parse
        # Some models include code fences — strip if present
        txt = raw.strip()
        if txt.startswith("```"):
            # remove ```json or ```
            txt = "\n".join(txt.splitlines()[1:-1]) if txt.count("\n") >= 2 else txt.strip("`")

        # ensure JSON decode
        data = json.loads(txt)
        return data

    except Exception as e:
        # Log and return heuristic fallback
        print("Analyze (GROQ) error:", e)
        return heuristic_analysis(payload)
