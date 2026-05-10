import sys
from sqlalchemy import text
from database import engine

def make_admin(email):
    print(f"Promoting user {email} to admin...")
    with engine.connect() as conn:
        try:
            result = conn.execute(text("UPDATE users SET is_admin = TRUE WHERE email = :email"), {"email": email})
            if result.rowcount > 0:
                print(f"Successfully promoted {email} to admin.")
            else:
                print(f"User with email {email} not found.")
            conn.commit()
        except Exception as e:
            print(f"Error promoting user: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <email>")
    else:
        make_admin(sys.argv[1])
