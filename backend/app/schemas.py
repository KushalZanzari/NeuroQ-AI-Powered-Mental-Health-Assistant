from pydantic import BaseModel, EmailStr

# --------------------
# REGISTER SCHEMA
# --------------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str 
    username: str 


# --------------------
# LOGIN
# --------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# --------------------
# USER OUTPUT
# --------------------
class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None = None
    username: str | None = None

    class Config:
        from_attributes = True  # (fixes orm_mode warning)


# --------------------
# TOKEN
# --------------------
class Token(BaseModel):
    access_token: str
    token_type: str
