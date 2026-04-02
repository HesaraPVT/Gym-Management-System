from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import os
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer

# Security config
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: Optional[int] = None
    admin_id: Optional[int] = None
    role: str

class TokenData(BaseModel):
    id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        id: int = payload.get("id")
        role: str = payload.get("role")
        if email is None:
            return None
        token_data = TokenData(email=email, id=id, role=role)
    except jwt.InvalidTokenError:
        return None
    return token_data

async def verify_token(credentials = Depends(HTTPBearer())) -> dict:
    """
    FastAPI dependency to verify JWT token from Authorization header.
    Extracts and validates the token, returning token data as a dict.
    Raises HTTPException with 401 status if token is invalid or missing.
    """
    token = credentials.credentials
    token_data = decode_token(token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Return as dict so it can be accessed with current_user["id"]
    return {
        "id": token_data.id,
        "email": token_data.email,
        "role": token_data.role
    }
