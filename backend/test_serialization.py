import os
import sys
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal
import models
import schemas
from pydantic import TypeAdapter
from typing import List

def test_user_bookings():
    db = SessionLocal()
    try:
        # Get user sandani28kanakarathna@gmail.com
        user = db.query(models.User).filter(models.User.email == "sandani28kanakarathna@gmail.com").first()
        if not user:
            print("User not found")
            return
            
        print(f"Testing bookings for user: {user.email} (ID: {user.id})")
        
        # Exact query from get_user_bookings
        bookings = db.query(models.Booking).options(
            joinedload(models.Booking.vehicle).joinedload(models.Vehicle.owner)
        ).filter(models.Booking.user_id == user.id).all()
        
        print(f"Found {len(bookings)} bookings")
        
        # Test serialization
        for b in bookings:
            print(f"Booking ID: {b.id}, Vehicle: {b.vehicle.name if b.vehicle else 'None'}")
            try:
                schema_booking = schemas.Booking.model_validate(b)
                print(f"  Serialization successful")
            except Exception as e:
                print(f"  Serialization failed: {e}")
                
    finally:
        db.close()

if __name__ == "__main__":
    test_user_bookings()
