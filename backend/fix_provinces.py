import os
import pymysql
from dotenv import load_dotenv
import re

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {DATABASE_URL}")
# Extract credentials from mysql+pymysql://root:chamudika2004@127.0.0.1/rentx_db
match = re.match(r"mysql\+.*?://(.*?):(.*?)@(.*?)/(.*)", DATABASE_URL)
if match:
    DB_USER, DB_PASS, DB_HOST, DB_NAME = match.groups()
    print(f"Parsed: user={DB_USER}, host={DB_HOST}, db={DB_NAME}")
else:
    print("Regex failed, using defaults")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASS = os.getenv("DB_PASS", "")
    DB_NAME = os.getenv("DB_NAME", "rentx_db")

district_province_map = {
    "Colombo": "Western",
    "Gampaha": "Western",
    "Kalutara": "Western",
    "Kandy": "Central",
    "Matale": "Central",
    "Nuwara Eliya": "Central",
    "Galle": "Southern",
    "Matara": "Southern",
    "Hambantota": "Southern",
    "Jaffna": "Northern",
    "Kilinochchi": "Northern",
    "Mannar": "Northern",
    "Mullaitivu": "Northern",
    "Vavuniya": "Northern",
    "Trincomalee": "Eastern",
    "Batticaloa": "Eastern",
    "Ampara": "Eastern",
    "Kurunegala": "North Western",
    "Puttalam": "North Western",
    "Anuradhapura": "North Central",
    "Polonnaruwa": "North Central",
    "Badulla": "Uva",
    "Monaragala": "Uva",
    "Ratnapura": "Sabaragamuwa",
    "Kegalle": "Sabaragamuwa"
}

def fix_provinces():
    conn = None
    try:
        print("Connecting to database using pymysql...")
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        cursor = conn.cursor()
        
        # Fetch all vehicles
        cursor.execute("SELECT id, district, location, province FROM vehicles")
        vehicles = cursor.fetchall()
        
        print(f"Checking {len(vehicles)} vehicles...")
        
        updated_count = 0
        for v in vehicles:
            district = v['district'] or v['location']
            if not district:
                continue
                
            correct_province = district_province_map.get(district)
            if not correct_province:
                # Try normalization (Nuwara Eliya case)
                for d, p in district_province_map.items():
                    if d.replace(" ", "").lower() == district.replace(" ", "").lower():
                        correct_province = p
                        break
            
            if correct_province and v['province'] != correct_province:
                print(f"Updating ID {v['id']}: {district} -> {correct_province} (was {v['province']})")
                cursor.execute(
                    "UPDATE vehicles SET province = %s WHERE id = %s",
                    (correct_province, v['id'])
                )
                updated_count += 1
        
        conn.commit()
        print(f"Successfully updated {updated_count} vehicles.")
        
    except Exception as e:
        print(f"Error occurred: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            cursor.close()
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    fix_provinces()
