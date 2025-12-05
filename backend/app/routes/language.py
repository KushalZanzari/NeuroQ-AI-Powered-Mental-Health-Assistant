from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/detect-language")


class LanguageRequest(BaseModel):
    text: str


@router.post("/")
def detect_language(request: LanguageRequest):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise HTTPException(400, detail="Missing Groq API key")

    try:
        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "Detect the language of the user's message. "
                               "Return ONLY the language name, nothing else."
                },
                {"role": "user", "content": request.text}
            ],
            max_tokens=20
        )

        detected = response.choices[0].message["content"].strip()

        return {"language": detected}

    except Exception as e:
        print("Language detection error:", e)
        raise HTTPException(500, detail="Failed to detect language")
