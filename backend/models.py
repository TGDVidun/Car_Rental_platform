# --- Models for RentX Application (Reload Trigger) ---
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from datetime import datetime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    is_admin = Column(Boolean, default=False)
    full_name = Column(String(255), nullable=True)
    phone_number = Column(String(20), nullable=True)
    
    bookings = relationship("Booking", back_populates="user")
    vehicles = relationship("Vehicle", back_populates="owner")

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False) # e.g., "Car", "Van", "SUV"
    location = Column(String(255), nullable=False)
    price_per_day = Column(Float, nullable=False)
    driver_price_per_day = Column(Float, default=1500.0) # Standard driver cost
    is_available = Column(Boolean, default=True)
    image_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    fuel_type = Column(String(50), nullable=True) # Petrol, Diesel, etc.
    transmission = Column(String(50), nullable=True) # Manual, Automatic
    has_driver = Column(Boolean, default=True)
    seats = Column(Integer, default=5)
    province = Column(String(100), nullable=True)
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    is_approved = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # New Location Fields
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    district = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    road = Column(String(255), nullable=True)

    bookings = relationship("Booking", back_populates="vehicle")
    owner = relationship("User", back_populates="vehicles")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    with_driver = Column(Boolean, default=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(50), default="pending") # pending, confirmed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    vehicle = relationship("Vehicle", back_populates="bookings")
    safety_logs = relationship("SafetyLog", back_populates="booking", cascade="all, delete")

class SafetyLog(Base):
    __tablename__ = "safety_logs"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    photo_url = Column(Text, nullable=False)
    condition_type = Column(String(100), nullable=False)
    note = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="safety_logs")
