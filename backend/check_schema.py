from database import engine
from sqlalchemy import inspect
import models

def check_schema():
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('vehicles')]
    print(f"Current columns in 'vehicles': {columns}")
    
    needed = ['province', 'rating', 'review_count']
    missing = [c for c in needed if c not in columns]
    if not missing:
        print("All columns exist!")
    else:
        print(f"Missing columns: {missing}")

if __name__ == "__main__":
    check_schema()
