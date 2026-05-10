from database import SessionLocal
import models

def view_vehicles():
    db = SessionLocal()
    vehicles = db.query(models.Vehicle).all()
    
    if not vehicles:
        print("No vehicles found in the database.")
        db.close()
        return

    print("\n--- VEHICLES IN DATABASE ---\n")
    # Simple formatting for the terminal
    template = "{0:<5} | {1:<20} | {2:<10} | {3:<15} | {4:<10}"
    print(template.format("ID", "NAME", "TYPE", "LOCATION", "PRICE"))
    print("-" * 70)
    
    for v in vehicles:
        print(template.format(v.id, v.name[:20], v.type, v.location, v.price_per_day))
    
    print("\n--- END OF LIST ---\n")
    db.close()

def view_users():
    db = SessionLocal()
    users = db.query(models.User).all()
    
    if not users:
        print("No users found.")
        db.close()
        return

    print("\n--- USERS IN DATABASE ---\n")
    template = "{0:<5} | {1:<30} | {2:<10}"
    print(template.format("ID", "EMAIL", "IS_ADMIN"))
    print("-" * 50)
    for u in users:
        print(template.format(u.id, u.email, str(u.is_admin)))
    db.close()

if __name__ == "__main__":
    view_vehicles()
    view_users()
