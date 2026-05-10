from fastapi import FastAPI
import email_utils
import uvicorn
import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

@app.get("/test-direct")
async def test_direct(email: str = "dulinavidungamage@gmail.com"):
    print(f"DIAGNOSTIC TEST: Sending email to {email}...")
    try:
        await email_utils.send_status_update_email(
            user_email=email,
            vehicle_name="Diagnostic Test App",
            status="confirmed"
        )
        return {"status": "success", "message": f"Email successfully sent to {email}"}
    except Exception as e:
        print(f"DIAGNOSTIC ERROR: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8003)
