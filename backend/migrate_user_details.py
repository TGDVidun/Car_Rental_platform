
from database import engine
from sqlalchemy import text

def add_user_columns():
    columns_to_add = [
        ("full_name", "VARCHAR(255)"),
        ("phone_number", "VARCHAR(20)")
    ]
    
    with engine.connect() as conn:
        for col_name, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                print(f"Added column {col_name} to users table.")
            except Exception as e:
                print(f"Column {col_name} might already exist: {e}")
        conn.commit()

if __name__ == "__main__":
    add_user_columns()
