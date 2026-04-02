from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError('Invalid objectid')
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type='string')

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: Optional[PyObjectId] = Field(alias='_id')
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True

class UserResponse(UserBase):
    id: Optional[str] = Field(alias='_id')
    created_at: datetime
    is_active: bool

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True

class AdminBase(BaseModel):
    name: str
    email: EmailStr

class AdminCreate(AdminBase):
    password: str

class Admin(AdminBase):
    id: Optional[PyObjectId] = Field(alias='_id')
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True

class AdminResponse(AdminBase):
    id: Optional[str] = Field(alias='_id')
    created_at: datetime
    is_active: bool

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True

class TrainerBase(BaseModel):
    name: str
    email: EmailStr
    specialization: Optional[str] = None

class TrainerCreate(TrainerBase):
    password: str

class Trainer(TrainerBase):
    id: Optional[PyObjectId] = Field(alias='_id')
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True

class TrainerResponse(TrainerBase):
    id: Optional[str] = Field(alias='_id')
    created_at: datetime
    is_active: bool

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True

# Measurement Schema
class MeasurementCreate(BaseModel):
    weight: float
    chest: float
    waist: float
    hips: float
    biceps: float
    date: Optional[datetime] = Field(default_factory=datetime.utcnow)

class MeasurementResponse(BaseModel):
    id: Optional[str] = Field(alias='_id')
    user_id: str
    weight: float
    chest: float
    waist: float
    hips: float
    biceps: float
    date: datetime

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True

# Workout Schema
class WorkoutCreate(BaseModel):
    name: str
    sets: int
    reps: int
    weight: float
    date: Optional[datetime] = Field(default_factory=datetime.utcnow)

class WorkoutResponse(BaseModel):
    id: Optional[str] = Field(alias='_id')
    user_id: str
    name: str
    sets: int
    reps: int
    weight: float
    date: datetime

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True


