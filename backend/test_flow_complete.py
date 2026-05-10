import requests
import json

BASE_URL = "http://127.0.0.1:8000" # Testing against the main running app

def test_full_flow():
    # 1. Login as owner
    print("Logging in as owner...")
    r = requests.post(f"{BASE_URL}/login", data={"username": "dulinavidungamage@gmail.com", "password": "password123"})
    if r.status_code != 200:
        print(f"Login failed: {r.text}")
        return
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 2. Find a vehicle owned by this user
    print("Fetching owner vehicles...")
    r = requests.get(f"{BASE_URL}/owner/vehicles", headers=headers)
    vehicles = r.json()
    if not vehicles:
        print("No vehicles found for owner")
        return
    v_id = vehicles[0]["id"]

    # 3. Create a pending booking (Manual DB injection is easier than signing up a new user)
    # Actually, I'll just use the signup endpoint for a test renter
    renter_email = "test_renter_antigravity@gmail.com"
    print(f"Creating renter user {renter_email}...")
    requests.post(f"{BASE_URL}/signup", json={"email": renter_email, "password": "password123"})
    
    # Login as renter to get their token
    r = requests.post(f"{BASE_URL}/login", data={"username": renter_email, "password": "password123"})
    renter_token = r.json()["access_token"]
    renter_headers = {"Authorization": f"Bearer {renter_token}", "Content-Type": "application/json"}

    # Create booking
    print(f"Creating booking for vehicle {v_id}...")
    booking_data = {
        "vehicle_id": v_id,
        "start_date": "2026-06-01T10:00:00",
        "end_date": "2026-06-03T10:00:00",
        "with_driver": False
    }
    r = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=renter_headers)
    if r.status_code != 200:
        print(f"Booking creation failed: {r.text}")
        return
    b_id = r.json()["id"]
    print(f"Created booking {b_id}")

    # 4. Approve booking as owner
    print(f"Approving booking {b_id} as owner...")
    r = requests.patch(f"{BASE_URL}/bookings/{b_id}", json={"status": "confirmed"}, headers=headers)
    print(f"Approval response: {r.status_code} - {r.json()}")

if __name__ == "__main__":
    try:
        test_full_flow()
    except Exception as e:
        print(f"Error: {e}")
