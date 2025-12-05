from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, chat, language, analyze, checkin

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# ---------------------------------------------------
# CORS
# ---------------------------------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://neuroq-ai-powered-mental-health-9t5b.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# ---------------------------------------------------
# INCLUDE ROUTERS (prefix ONLY here)
# ---------------------------------------------------
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(language.router, prefix="/language", tags=["Language"])
app.include_router(checkin.router, prefix="/checkin", tags=["Checkin"])
app.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
