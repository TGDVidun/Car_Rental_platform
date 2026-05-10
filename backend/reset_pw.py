from database import SessionLocal
from models import User
from auth import get_password_hash, verify_password

db = SessionLocal()
u = db.query(User).filter(User.email == 'dulinavidungamage@gmail.com').first()
if u:
    u.hashed_password = get_password_hash('admin1234')
    db.commit()
    ok = verify_password('admin1234', u.hashed_password)
    print(f'Password reset for: {u.email}')
    print(f'Verification OK: {ok}')
else:
    print('User not found!')
db.close()
