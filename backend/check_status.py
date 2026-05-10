from database import SessionLocal
import models

def check_latest_bookings():
    db = SessionLocal()
    print("\n--- LATEST BOOKINGS ---")
    bookings = db.query(models.Booking).order_by(models.Booking.id.desc()).limit(5).all()
    template = "{0:<5} | {1:<25} | {2:<20} | {3:<10}"
    print(template.format("ID", "RENTER", "VEHICLE", "STATUS"))
    print("-" * 70)
    for b in bookings:
        renter = b.user.email if b.user else "N/A"
        vehicle = b.vehicle.name if b.vehicle else "N/A"
        print(template.format(b.id, renter, vehicle, b.status))
    db.close()

if __name__ == "__main__":
    check_latest_bookings()
