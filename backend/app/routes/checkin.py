from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
import json
import os
from groq import Groq
from ..routes.auth import get_current_user
import re 

router = APIRouter(tags=["Check-ins"])

DB_FILE = "checkins.json"   # JSON database file


# ---------------------------
# Pydantic Models
# ---------------------------
class CheckInRequest(BaseModel):
    thoughts: str
    symptoms: list[str]
    mood: int
    sleep_hours: float
    stress_level: int
    prediction: dict | None = None

# -------- NEW MODEL (Save Prediction) --------
class SavePrediction(BaseModel):
    predicted_disorder: str
    confidence_score: float
    severity_level: str
    recommendations: str
    next_steps: str | None = ""    

# ---------------------------
# Utility: Read / Write JSON
# ---------------------------
def load_db():
    if not os.path.exists(DB_FILE):
        return []
    with open(DB_FILE, "r") as f:
        try:
            return json.load(f)
        except:
            return []


def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

# ✅ NEW — SAFE JSON EXTRACTOR
def extract_json(text: str):
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise HTTPException(500, detail="AI returned invalid JSON")
    return json.loads(match.group(0))


# ---------------------------
# POST /checkin → Analyze + Save
# ---------------------------
@router.post("/")
def submit_checkin(req: CheckInRequest, user=Depends(get_current_user)):

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(500, detail="Missing GROQ API KEY")

    client = Groq(api_key=api_key)

    # ---------- AI PREDICTION ----------
    prompt = f"""
    You are a mental health assessment assistant.

    Based on the data:

    Thoughts: {req.thoughts}
    Symptoms: {", ".join(req.symptoms)}
    Mood level (1-10): {req.mood}
    Sleep hours: {req.sleep_hours}
    Stress level (1-10): {req.stress_level}

    Provide:
    1. Predicted disorder (1 word)
    2. Severity (mild/moderate/severe)
    3. Confidence (0.0–1.0)
    4. Recommendations (2–3 sentences)

    Respond in JSON:
    {{
        "predicted_disorder": "",
        "severity_level": "",
        "confidence_score": 0.0,
        "recommendations": ""
    }}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )

        ai_raw = response.choices[0].message.content
        prediction = extract_json(ai_raw)

    except Exception as e:
        print("Prediction error:", e)
        raise HTTPException(500, detail="Prediction failed")

    # ---------- CREATE STORAGE RECORD ----------
    db = load_db()

    record = {
        "id": len(db) + 1,
        "user_id": user.id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "title": prediction["predicted_disorder"],
        "input": req.dict(),
        "prediction": prediction
    }

    db.append(record)
    save_db(db)

    return record


# ---------------------------
# GET /checkin → Fetch History
# ---------------------------
@router.get("/")
def get_history(user=Depends(get_current_user)):

    db = load_db()

    # return only the current user's check-ins
    user_records = [r for r in db if r["user_id"] == user.id]

    # sort newest → oldest
    user_records.sort(key=lambda x: x["timestamp"], reverse=True)

    return user_records


# ===================================================
# 🚀 NEW ENDPOINT #1 — DASHBOARD STATS
# ===================================================
@router.get("/stats")
def get_stats(user=Depends(get_current_user)):
    db = load_db()
    user_data = [r for r in db if r["user_id"] == user.id]

    total = len(user_data)
    last_checkin = user_data[-1]["timestamp"] if total > 0 else None

    # compute streak based on unique days
    dates = sorted([
        r["timestamp"][:10] for r in user_data
    ], reverse=True)

    streak = 0
    today = datetime.utcnow().date()

    for d in dates:
        day = datetime.fromisoformat(d).date()
        if day == today - timedelta(days=streak):
            streak += 1
        else:
            break

    return {
        "total_checkins": total,
        "streak": streak,
        "last_checkin": last_checkin,
        "ai_sessions": 0
    }



# ===================================================
# 🚀 NEW ENDPOINT #2 — RECENT SUBMISSIONS (last 5)
# ===================================================
@router.get("/recent")
def get_recent(user=Depends(get_current_user)):
    db = load_db()
    user_data = [r for r in db if r["user_id"] == user.id]

    # newest first
    user_data.sort(key=lambda x: x["timestamp"], reverse=True)

    recent = []
    for r in user_data[:5]:
        recent.append({
            "id": r["id"],
            "date": r["timestamp"],
            "disorder": r["prediction"]["predicted_disorder"],
            "severity": r["prediction"]["severity_level"],
            "confidence": r["prediction"]["confidence_score"]
        })

    return recent


# ===================================================
# 🚀 NEW ENDPOINT #3 — SAVE PREDICTION MANUALLY
# ===================================================
@router.post("/save")
def save_manual_prediction(data: SavePrediction, user=Depends(get_current_user)):

    db = load_db()

    record = {
        "id": len(db) + 1,
        "user_id": user.id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "title": data.predicted_disorder,
        "input": {},
        "prediction": data.dict()
    }

    db.append(record)
    save_db(db)

    return {"status": True, "id": record["id"]}

# ===================================================
# 🚀 NEW ENDPOINT — DELETE A CHECK-IN RECORD
# ===================================================
@router.delete("/delete/{checkin_id}")
def delete_checkin(checkin_id: int, user=Depends(get_current_user)):
    db = load_db()

    # Find record
    record = next((r for r in db if r["id"] == checkin_id and r["user_id"] == user.id), None)
    if not record:
        raise HTTPException(404, detail="Record not found")

    # Remove record
    db = [r for r in db if r["id"] != checkin_id]
    save_db(db)

    return {"status": "deleted", "id": checkin_id}

