from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:chamudika2004@127.0.0.1:3306/rentx_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_vehicles():
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT * FROM vehicles ORDER BY id DESC LIMIT 5"))
        columns = result.keys()
        print(f"Columns: {columns}")
        for row in result:
            print(dict(zip(columns, row)))
    finally:
        db.close()

if __name__ == "__main__":
    check_vehicles()
