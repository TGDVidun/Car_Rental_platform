import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# Parse database URL
db_url = os.getenv("DATABASE_URL")
# mysql+mysqlconnector://root:chamudika2004@localhost/rentx_db
db_user = "root"
db_password = "chamudika2004"
db_host = "localhost"
db_name = "rentx_db"

def migrate():
    try:
        conn = mysql.connector.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            database=db_name
        )
        cursor = conn.cursor()
        
        print("Adding new columns to 'vehicles' table...")
        
        # Add province
        try:
            cursor.execute("ALTER TABLE vehicles ADD COLUMN province VARCHAR(100) DEFAULT 'Western'")
            print("Added 'province' column.")
        except mysql.connector.Error as err:
            print(f"Error adding 'province': {err}")

        # Add rating
        try:
            cursor.execute("ALTER TABLE vehicles ADD COLUMN rating FLOAT DEFAULT 5.0")
            print("Added 'rating' column.")
        except mysql.connector.Error as err:
            print(f"Error adding 'rating': {err}")

        # Add review_count
        try:
            cursor.execute("ALTER TABLE vehicles ADD COLUMN review_count INT DEFAULT 0")
            print("Added 'review_count' column.")
        except mysql.connector.Error as err:
            print(f"Error adding 'review_count': {err}")

        conn.commit()
        cursor.close()
        conn.close()
        print("Migration complete!")
        
    except mysql.connector.Error as err:
        print(f"Connection error: {err}")

if __name__ == "__main__":
    migrate()
