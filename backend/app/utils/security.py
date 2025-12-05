from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext

# bcrypt configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto",bcrypt__ident = "2b")

# JWT secret & settings
SECRET_KEY = "supersecretkey123"     # <-- you will later move this into .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# -------------------------------
# PASSWORD HASHING
# -------------------------------

def hash_password(password: str) -> str:
    """Hash a user's password."""
    if not isinstance(password, str):
        password = str(password)

    # bcrypt max: 72 bytes
    password = password[:72]

    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a user's password."""
    plain_password = str(plain_password)[:72]
    return pwd_context.verify(plain_password, hashed_password)


# -------------------------------
# JWT TOKEN CREATION
# -------------------------------

def create_access_token(data: dict, expires_delta: Optional[int] = None):
    """Generate a JWT token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=expires_delta or ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

from jose import JWTError, jwt
from fastapi import HTTPException

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
