from sqlalchemy import text
from database import engine, SessionLocal
import models

def update_db():
    print("Adding reset_token columns to users table...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL"))
            print("Added reset_token column.")
        except Exception as e:
            print(f"reset_token column might already exist or error: {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL"))
            print("Added reset_token_expires column.")
        except Exception as e:
            print(f"reset_token_expires column might already exist or error: {e}")
        
        conn.commit()
    print("Database update complete.")

if __name__ == "__main__":
    update_db()
