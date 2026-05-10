from database import SessionLocal
import models

def seed_vehicles():
    db = SessionLocal()
    
    # Check if vehicles already exist
    if db.query(models.Vehicle).first():
        print("Vehicles already exist in the database. Skipping seed.")
        db.close()
        return

    sample_vehicles = [
        {
            "name": "Honda Civic",
            "type": "Car",
            "location": "Colombo",
            "price_per_day": 8500.0,
            "driver_price_per_day": 1500.0,
            "image_url": "https://images.unsplash.com/photo-1599912027806-cfec9f5944b6?auto=format&fit=crop&q=80&w=800",
            "description": "Comfortable and stylish sedan, perfect for city driving."
        },
        {
            "name": "Toyota Prius",
            "type": "Car",
            "location": "Kandy",
            "price_per_day": 9500.0,
            "driver_price_per_day": 1500.0,
            "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
            "description": "High-performance SUV with premium features.",
            "fuel_type": "Petrol",
            "transmission": "Automatic",
            "has_driver": True,
            "seats": 5
        },
        {
            "name": "Luxury Sedan",
            "type": "Car",
            "location": "Colombo",
            "price_per_day": 12000.0,
            "driver_price_per_day": 2000.0,
            "image_url": "https://images.unsplash.com/photo-1555215695-3004980ad94e?auto=format&fit=crop&q=80&w=800",
            "description": "Elegant luxury sedan for business or special events.",
            "fuel_type": "Petrol",
            "transmission": "Automatic",
            "has_driver": True,
            "seats": 4
        },
        {
            "name": "Toyota KDH",
            "type": "Van",
            "location": "Colombo",
            "price_per_day": 12000.0,
            "driver_price_per_day": 2000.0,
            "image_url": "https://images.unsplash.com/photo-1563720223185-11003d516905?auto=format&fit=crop&q=80&w=800",
            "description": "Large passenger van, ideal for families and group travels."
        },
        {
            "name": "Mitsubishi Montero",
            "type": "SUV",
            "location": "Galle",
            "price_per_day": 15000.0,
            "driver_price_per_day": 2500.0,
            "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
            "description": "Powerful SUV designed for off-road adventures and luxury travel."
        },
        {
            "name": "Suzuki Wagon R",
            "type": "Car",
            "location": "Negombo",
            "price_per_day": 5500.0,
            "driver_price_per_day": 1500.0,
            "image_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
            "description": "Reliable and economical compact car, great for quick trips."
        }
    ]

    for v_data in sample_vehicles:
        vehicle = models.Vehicle(**v_data)
        db.add(vehicle)
    
    db.commit()
    print("Sample vehicles added to the database.")
    db.close()

if __name__ == "__main__":
    seed_vehicles()
