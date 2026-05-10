from database import SessionLocal
import models
from datetime import datetime, timedelta

def create_external_booking():
    db = SessionLocal()
    # Find or create a user with a different email
    test_email = "test.renter.rentx@gmail.com"
    user = db.query(models.User).filter(models.User.email == test_email).first()
    if not user:
        user = models.User(email=test_email, hashed_password="hashed_password")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Get a vehicle
    vehicle = db.query(models.Vehicle).first()
    if not vehicle:
        print("No vehicles found")
        return

    # Create a pending booking
    booking = models.Booking(
        user_id=user.id,
        vehicle_id=vehicle.id,
        start_date=datetime.utcnow() + timedelta(days=1),
        end_date=datetime.utcnow() + timedelta(days=3),
        with_driver=False,
        total_price=vehicle.price_per_day * 2,
        status="pending"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    print(f"Created pending booking {booking.id} for {test_email}")
    db.close()

if __name__ == "__main__":
    create_external_booking()
