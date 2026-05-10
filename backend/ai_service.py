import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)
else:
    print("WARNING: OPENAI_API_KEY not found in .env")

# System instruction to make the AI act as a car rental assistant
SYSTEM_INSTRUCTION = """
You are RentX AI, a professional and helpful virtual assistant for RentX, a premium car rental platform.
Your goal is to help users find the perfect car, explain rental terms, and provide information about the service.

Guidelines:
1. Be polite, professional, and enthusiastic.
2. Provide concise and accurate information.
3. If a user asks about car availability, suggest they use the search page.
4. If a user asks about pricing, mention that it varies by vehicle and duration.
5. If a user asks about booking, explain that they can book directly through the vehicle details page.
6. If you don't know something, offer to connect them with human support (contact@rentx.com).
7. Keep responses focused on car rentals and RentX services.

Company Info:
- Name: RentX
- Services: Daily car rentals, chauffeur-driven services, long-term leasing.
- Contact: support@rentx.com / +94 11 234 5678
- Location: Head office in Colombo, Sri Lanka.
"""

def get_ai_response(message, history=None):
    if not OPENAI_API_KEY:
        return "I'm sorry, my AI brain is currently disconnected. Please contact support or try again later."
    
    try:
        # Prepare messages for OpenAI format
        messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
        
        # Add history if provided
        if history:
            for msg in history:
                # OpenAI uses "assistant" instead of "model"
                role = "assistant" if msg["role"] == "model" else msg["role"]
                content = "".join(msg["parts"]) if isinstance(msg["parts"], list) else msg["parts"]
                messages.append({"role": role, "content": content})
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        response = client.chat.completions.create(
            model="gpt-4o", # or "gpt-3.5-turbo"
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error getting AI response: {e}")
        return "I encountered a bit of a glitch. Could you please try again in a moment?"
