from sqlalchemy import text
from database import engine

def migrate():
    print("Running vehicle specifications migration...")
    with engine.connect() as conn:
        # Add columns to vehicles
        columns = [
            ("fuel_type", "VARCHAR(50) DEFAULT 'Petrol'"),
            ("transmission", "VARCHAR(50) DEFAULT 'Automatic'"),
            ("has_driver", "BOOLEAN DEFAULT TRUE"),
            ("seats", "INT DEFAULT 5")
        ]
        
        for col_name, col_type in columns:
            try:
                conn.execute(text(f"ALTER TABLE vehicles ADD COLUMN {col_name} {col_type}"))
                print(f"Added {col_name} column to vehicles.")
            except Exception as e:
                print(f"Column {col_name} might already exist or error: {e}")
        
        conn.commit()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
