from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        print("Adding 'province' column...")
        try:
            conn.execute(text("ALTER TABLE vehicles ADD COLUMN province VARCHAR(100) DEFAULT 'Western'"))
            print("Added 'province'.")
        except Exception as e:
            print(f"Already exists or error: {str(e)}")
            
        print("Adding 'rating' column...")
        try:
            conn.execute(text("ALTER TABLE vehicles ADD COLUMN rating FLOAT DEFAULT 5.0"))
            print("Added 'rating'.")
        except Exception as e:
            print(f"Already exists or error: {str(e)}")

        print("Adding 'review_count' column...")
        try:
            conn.execute(text("ALTER TABLE vehicles ADD COLUMN review_count INT DEFAULT 0"))
            print("Added 'review_count'.")
        except Exception as e:
            print(f"Already exists or error: {str(e)}")
            
        conn.commit()
        print("Migration complete!")

if __name__ == "__main__":
    migrate()
