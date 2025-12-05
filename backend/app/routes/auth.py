from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import SessionLocal
from .. import models, schemas
from ..utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)

router = APIRouter()   # ✅ REMOVE prefix="/auth"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ---------------------------
# Get current user
# ---------------------------
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = decode_access_token(token)
    email = payload.get("sub")

    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ---------------------------
# REGISTER
# ---------------------------
@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        email=user.email,
        full_name=user.full_name,
        username=user.username,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ---------------------------
# LOGIN
# ---------------------------
@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "username": db_user.username,
            "created_at": db_user.created_at.isoformat() if db_user.created_at else None
        }
    }


# ---------------------------
# GET PROFILE
# ---------------------------
@router.get("/me")
def get_me(user: models.User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "username": user.username,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }


# ---------------------------
# UPDATE PROFILE
# ---------------------------
class UpdateProfile(BaseModel):
    full_name: str | None = None
    username: str | None = None


@router.put("/update-profile")
def update_profile(
    data: UpdateProfile,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = False

    if data.full_name:
        user.full_name = data.full_name
        updated = True

    if data.username:
        user.username = data.username
        updated = True

    if updated:
        db.commit()
        db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "username": user.username,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }
