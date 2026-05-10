import requests

# 1. Login to get token
login_url = "http://127.0.0.1:8001/login"
login_data = {"username": "dulinavidungamage@gmail.com", "password": "password"} # I'll assume password is "password" based on typical test setups.
# Wait, I don't know the password! I'll check my view_db.py or use a new signup.

# Or better, I'll just use my DB script to get a user and their hashed_password or just create a new one.

# Actually, I'll use a script to call the endpoint directly WITHOUT going through HTTP, to see if the uvicorn logs show the background task.
# No, that won't help if it's an HTTP/FastAPI specific issue.

# I'll create a new user for testing.
signup_url = "http://127.0.0.1:8001/signup"
signup_data = {"email": "testowner@example.com", "password": "testpassword"}
requests.post(signup_url, json=signup_data)

# Login
r = requests.post(login_url, data={"username": "testowner@example.com", "password": "testpassword"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Create a vehicle for this owner
vehicle_url = "http://127.0.0.1:8001/vehicles"
vehicle_data = {
    "name": "Test Car",
    "type": "Car",
    "location": "Colombo",
    "price_per_day": 5000,
    "driver_price_per_day": 1500,
    "is_available": True
}
v_r = requests.post(vehicle_url, json=vehicle_data, headers=headers)
v_id = v_r.json()["id"]

# Create a booking as someone else (or same user for simplicity)
booking_url = "http://127.0.0.1:8001/bookings"
booking_data = {
    "vehicle_id": v_id,
    "start_date": "2026-05-01T10:00:00",
    "end_date": "2026-05-03T10:00:00",
    "with_driver": False
}
b_r = requests.post(booking_url, json=booking_data, headers=headers)
b_id = b_r.json()["id"]

# Now Approve it!
approve_url = f"http://127.0.0.1:8001/bookings/{b_id}"
approve_data = {"status": "confirmed"}
print(f"Approving booking {b_id}...")
a_r = requests.patch(approve_url, json=approve_data, headers=headers)
print(f"Status: {a_r.status_code}")
print(f"Response: {a_r.json()}")
