from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
from app.routes.auth import get_current_user

load_dotenv()

router = APIRouter()

# Request model
class ChatRequest(BaseModel):
    message: str


#  AUTO LANGUAGE DETECTION
def detect_language(text: str):

    # Hindi
    if any("\u0900" <= ch <= "\u097F" for ch in text):
        return "hi"

    # Gujarati
    if any("\u0A80" <= ch <= "\u0AFF" for ch in text):
        return "gu"

    # Telugu
    if any("\u0C00" <= ch <= "\u0C7F" for ch in text):
        return "te"

    # Marathi (same script as Hindi, but optional)
    if any("\u0900" <= ch <= "\u097F" for ch in text):
        return "mr"

    # Default English
    return "en"

#  NEW: SMART CHAT TITLE GENERATION
def generate_title(client, user_message: str):
    prompt = (
        f"Generate a short 3–6 word title describing the topic of this message: "
        f"'{user_message}'. Return ONLY the title, no explanation."
    )

    res = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=20
    )

    return res.choices[0].message.content.strip()

@router.post("/")
def chat_with_bot(request: ChatRequest, user=Depends(get_current_user)):

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(500, detail="Groq API key missing in environment")

    try:
        client = Groq(api_key=api_key)

        #  Detect language of user input
        detected_lang = detect_language(request.message)

        #  System prompt: make AI reply in same language
        system_prompt = f"""
        You are a multilingual AI. Detect the user's language and always reply 
        in the same language. Detected language: {detected_lang}.
        """
        
        #  AI MAIN REPLY
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            max_tokens=300
        )

        ai_reply = response.choices[0].message.content

        # Generate smart chat title (only from user message)
        smart_title = generate_title(client, request.message)

        return {
            "reply": ai_reply,
            "language": detected_lang,  #  send to frontend for TTS
            "title": smart_title 
        }

    except Exception as e:
        print("Groq error:", e)
        raise HTTPException(500, detail="Failed to connect to Groq API")
