from sqlalchemy import text
from database import engine

def update_db():
    print("Adding admin and approval columns...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE"))
            print("Added is_admin column to users.")
        except Exception as e:
            print(f"is_admin column might already exist or error: {e}")
            
        try:
            conn.execute(text("ALTER TABLE vehicles ADD COLUMN is_approved BOOLEAN DEFAULT FALSE"))
            print("Added is_approved column to vehicles.")
        except Exception as e:
            print(f"is_approved column might already exist or error: {e}")
        
        # Set existing vehicles as approved so they don't disappear from the site
        try:
            conn.execute(text("UPDATE vehicles SET is_approved = TRUE"))
            print("Set existing vehicles as approved.")
        except Exception as e:
            print(f"Error updating existing vehicles: {e}")

        conn.commit()
    print("Database update complete.")

if __name__ == "__main__":
    update_db()
