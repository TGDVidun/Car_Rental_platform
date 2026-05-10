"""
Migration script to add any missing columns to existing tables.
Safe to run multiple times - checks if column exists before adding.
"""
from database import engine
from sqlalchemy import text, inspect

def run_migrations():
    inspector = inspect(engine)
    
    with engine.connect() as conn:
        # --- safety_logs table ---
        if 'safety_logs' in inspector.get_table_names():
            sl_cols = [c['name'] for c in inspector.get_columns('safety_logs')]
            print(f"safety_logs existing columns: {sl_cols}")
            
            if 'is_read' not in sl_cols:
                conn.execute(text("ALTER TABLE safety_logs ADD COLUMN is_read BOOLEAN DEFAULT FALSE"))
                print("  ✅ Added is_read column to safety_logs")
            else:
                print("  ✅ is_read already exists")
                
            if 'created_at' not in sl_cols:
                conn.execute(text("ALTER TABLE safety_logs ADD COLUMN created_at DATETIME DEFAULT NOW()"))
                print("  ✅ Added created_at column to safety_logs")
            else:
                print("  ✅ created_at already exists")
        else:
            print("safety_logs table does not exist yet - will be created fresh")

        # --- bookings table ---
        if 'bookings' in inspector.get_table_names():
            b_cols = [c['name'] for c in inspector.get_columns('bookings')]
            print(f"\nbookings existing columns: {b_cols}")
            
            for col, col_type in [
                ('with_driver', 'BOOLEAN DEFAULT FALSE'),
                ('total_price', 'FLOAT DEFAULT 0'),
                ('status', "VARCHAR(50) DEFAULT 'pending'"),
            ]:
                if col not in b_cols:
                    conn.execute(text(f"ALTER TABLE bookings ADD COLUMN {col} {col_type}"))
                    print(f"  ✅ Added {col} to bookings")
                else:
                    print(f"  ✅ {col} already exists in bookings")

        # --- vehicles table ---
        if 'vehicles' in inspector.get_table_names():
            v_cols = [c['name'] for c in inspector.get_columns('vehicles')]
            print(f"\nvehicles existing columns: {v_cols}")
            
            for col, col_type in [
                ('driver_price_per_day', 'FLOAT DEFAULT 1500.0'),
                ('fuel_type', 'VARCHAR(50)'),
                ('transmission', 'VARCHAR(50)'),
                ('has_driver', 'BOOLEAN DEFAULT TRUE'),
                ('seats', 'INTEGER DEFAULT 5'),
                ('province', 'VARCHAR(100)'),
                ('rating', 'FLOAT DEFAULT 5.0'),
                ('review_count', 'INTEGER DEFAULT 0'),
                ('owner_id', 'INTEGER'),
            ]:
                if col not in v_cols:
                    conn.execute(text(f"ALTER TABLE vehicles ADD COLUMN {col} {col_type}"))
                    print(f"  ✅ Added {col} to vehicles")
                else:
                    print(f"  ✅ {col} already exists in vehicles")

        # --- users table ---
        if 'users' in inspector.get_table_names():
            u_cols = [c['name'] for c in inspector.get_columns('users')]
            print(f"\nusers existing columns: {u_cols}")
            
            for col, col_type in [
                ('reset_token', 'VARCHAR(255)'),
                ('reset_token_expires', 'DATETIME'),
            ]:
                if col not in u_cols:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                    print(f"  ✅ Added {col} to users")
                else:
                    print(f"  ✅ {col} already exists in users")

        conn.commit()
        print("\n✅ Migration complete!")

if __name__ == "__main__":
    run_migrations()
