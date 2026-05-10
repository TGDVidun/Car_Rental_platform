from sqlalchemy import text
from database import engine

def migrate():
    print("Running admin dashboard migration...")
    with engine.connect() as conn:
        # Add owner_id to vehicles if it doesn't exist
        try:
            conn.execute(text("ALTER TABLE vehicles ADD COLUMN owner_id INT NULL"))
            conn.execute(text("ALTER TABLE vehicles ADD CONSTRAINT fk_vehicle_owner FOREIGN KEY (owner_id) REFERENCES users(id)"))
            print("Added owner_id column to vehicles.")
        except Exception as e:
            print(f"Column owner_id might already exist or error: {e}")

        # Update existing vehicles to belong to the first user as a default owner
        try:
            # Get the first user ID
            res = conn.execute(text("SELECT id FROM users LIMIT 1"))
            first_user = res.fetchone()
            if first_user:
                uid = first_user[0]
                conn.execute(text(f"UPDATE vehicles SET owner_id = {uid} WHERE owner_id IS NULL"))
                print(f"Updated existing vehicles to belong to User ID: {uid}")
            else:
                print("No users found to assign vehicles to.")
        except Exception as e:
            print(f"Error updating owners: {e}")
        
        conn.commit()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
