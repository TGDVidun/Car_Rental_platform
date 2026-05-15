from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    email: str
    is_admin: bool
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# Vehicle Schemas
class VehicleBase(BaseModel):
    name: str
    type: str
    location: str
    price_per_day: float
    driver_price_per_day: float
    is_available: bool = True
    image_url: Optional[str] = None
    description: Optional[str] = None
    fuel_type: Optional[str] = "Petrol"
    transmission: Optional[str] = "Automatic"
    has_driver: bool = True
    seats: int = 5
    province: Optional[str] = "Western"
    rating: float = 5.0
    review_count: int = 0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    district: Optional[str] = None
    city: Optional[str] = None
    road: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleStatusUpdate(BaseModel):
    is_available: bool

class VehicleApprovalUpdate(BaseModel):
    is_approved: bool

class Vehicle(VehicleBase):
    id: int
    owner_id: Optional[int] = None
    owner: Optional[UserResponse] = None
    is_approved: bool = False

    class Config:
        from_attributes = True

# Safety Log Schemas
class SafetyLogBase(BaseModel):
    photo_url: str
    condition_type: str
    note: Optional[str] = None
    is_read: bool = False

class SafetyLogCreate(SafetyLogBase):
    pass

class SafetyLog(SafetyLogBase):
    id: int
    booking_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Booking Schemas
class BookingBase(BaseModel):
    vehicle_id: Optional[int] = None
    start_date: datetime
    end_date: datetime
    with_driver: bool = False

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: int
    user_id: int
    total_price: float
    status: str
    created_at: Optional[datetime] = None
    vehicle: Optional[Vehicle] = None
    user: Optional[User] = None
    safety_logs: List[SafetyLog] = []

    class Config:
        from_attributes = True

class BookingStatusUpdate(BaseModel):
    status: str # "confirmed" or "cancelled"

class OwnerStats(BaseModel):
    total_cars: int
    total_bookings: int
    pending_bookings: int
    confirmed_bookings: int
    monthly_revenue: float

# Chat Schemas
class ChatMessage(BaseModel):
    role: str # "user" or "model"
    parts: List[str]

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    response: str
