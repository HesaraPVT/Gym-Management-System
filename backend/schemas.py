from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Name must be 2-100 characters")
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=256, description="Password must be 6-256 characters")

class UserSignin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

class UserResponse(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    created_at: datetime
    is_active: bool

    class Config:
        arbitrary_types_allowed = True

class UserWithToken(BaseModel):
    user: UserResponse
    token: str
    token_type: str
    role: str

    class Config:
        arbitrary_types_allowed = True

# Admin Schemas
class AdminCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Name must be 2-100 characters")
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=256, description="Password must be 6-256 characters")

class AdminSignin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

class AdminResponse(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    created_at: datetime
    is_active: bool

    class Config:
        arbitrary_types_allowed = True

class AdminWithToken(BaseModel):
    admin: AdminResponse
    token: str
    token_type: str
    role: str

    class Config:
        arbitrary_types_allowed = True

# Trainer Schemas
class TrainerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Name must be 2-100 characters")
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=256, description="Password must be 6-256 characters")
    specialization: Optional[str] = None

class TrainerSignin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

class TrainerResponse(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    specialization: Optional[str] = None
    created_at: datetime
    is_active: bool

    class Config:
        arbitrary_types_allowed = True

class TrainerWithToken(BaseModel):
    user: TrainerResponse
    token: str
    token_type: str
    role: str

    class Config:
        arbitrary_types_allowed = True

# Measurement Schemas
class MeasurementCreate(BaseModel):
    weight: float = Field(..., gt=0, description="Weight must be greater than 0")
    bodyFat: float = Field(..., ge=0, le=100, description="Body Fat must be between 0-100%")
    muscleMass: float = Field(..., gt=0, description="Muscle Mass must be greater than 0")
    height: float = Field(..., gt=0, description="Height must be greater than 0")
    date: Optional[str] = None

class MeasurementResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    weight: float
    bodyFat: float
    muscleMass: float
    height: float
    date: str

    class Config:
        arbitrary_types_allowed = True

# Workout Schemas
class WorkoutCreate(BaseModel):
    exercise: str = Field(..., min_length=1, description="Exercise name required")
    sets: int = Field(..., ge=1, description="Sets must be at least 1")
    reps: int = Field(..., ge=1, description="Reps must be at least 1")
    weight: float = Field(..., gt=0, le=500, description="Weight must be between 0 and 500 kg")
    date: Optional[str] = None

class WorkoutResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    exercise: str
    sets: int
    reps: int
    weight: float
    date: str

    class Config:
        arbitrary_types_allowed = True


# ==================== INVENTORY SCHEMAS ====================

# Supplier Schemas
class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200, description="Supplier name required")
    email: EmailStr
    phone: str = Field(..., min_length=5, description="Phone is required")
    address: Optional[str] = None
    contact_person: Optional[str] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None

class SupplierResponse(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    phone: str
    address: Optional[str]
    contact_person: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        arbitrary_types_allowed = True


# Product Schemas
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200, description="Product name required")
    description: Optional[str] = None
    category: str = Field(..., min_length=2, description="Category required")
    unit_price: float = Field(..., gt=0, description="Unit price must be greater than 0")
    initial_quantity: int = Field(..., ge=0, description="Initial quantity must be >= 0")
    reorder_level: int = Field(..., ge=0, description="Reorder level must be >= 0")

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[float] = None
    reorder_level: Optional[int] = None

class ProductResponse(BaseModel):
    id: Optional[str] = None
    product_code: str
    name: str
    description: Optional[str]
    category: str
    unit_price: float
    total_quantity: int
    batches: Optional[list] = []
    reorder_level: int
    is_active: bool
    created_at: datetime

    class Config:
        arbitrary_types_allowed = True


# Invoice Item
class InvoiceItem(BaseModel):
    product_id: str
    product_name: Optional[str] = None
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    line_total: Optional[float] = None

class InvoiceCreate(BaseModel):
    supplier_id: str
    items: list[InvoiceItem] = Field(..., min_items=1)
    notes: Optional[str] = None

class InvoiceResponse(BaseModel):
    id: Optional[str] = None
    invoice_number: str
    supplier_id: str
    supplier_name: Optional[str]
    items: list[InvoiceItem]
    total_amount: float
    created_at: datetime

    class Config:
        arbitrary_types_allowed = True


# Stock Movement Schemas
class StockMovementCreate(BaseModel):
    product_id: str
    movement_type: str = Field(..., pattern="^(in|out|adjustment)$", description="Movement type: in, out, or adjustment")
    quantity: int = Field(..., gt=0)
    reason: Optional[str] = None

class StockMovementResponse(BaseModel):
    id: Optional[str] = None
    product_id: str
    product_code: Optional[str]
    product_name: Optional[str]
    movement_type: str
    quantity: int
    reason: Optional[str]
    created_at: datetime

    class Config:
        arbitrary_types_allowed = True
