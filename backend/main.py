import os
import logging
from dotenv import load_dotenv
load_dotenv()
import shutil
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal, engine, get_db
import models, schemas, auth, email_utils, ai_service
import stripe
from jose import JWTError, jwt

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("LOG TEST: TOP LEVEL OF MAIN.PY LOADED")

# Stripe Setup
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
if stripe.api_key:
    logger.info(f"Stripe API Key loaded: {stripe.api_key[:8]}...")
else:
    logger.warning("Stripe API Key NOT FOUND in environment!")

# Add file handler for diagnostics
file_handler = logging.FileHandler("backend_debug.log")
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)
logging.getLogger("email_utils").addHandler(file_handler)

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="RentX Backend AI-VERSION")

# OAuth2 setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

async def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user

# Mount the uploads directory to serve images
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("--- RENTX BACKEND (VERSION 2 - AI CHAT) STARTED SUCCESSFULLY ---")

@app.get("/")
def read_root():
    return {"message": "Welcome to RentX API"}

@app.get("/test-chat")
def test_chat():
    return {"message": "Chat endpoint is reachable"}

@app.post("/chat", response_model=schemas.ChatResponse)
async def chat(request: schemas.ChatRequest):
    logger.info(f"LOG TEST: CHAT ROUTE CALLED with message: {request.message}")
    # Convert history from Pydantic models to dicts if provided
    history = []
    if request.history:
        for msg in request.history:
            history.append({
                "role": msg.role,
                "parts": msg.parts
            })
    
    response_text = ai_service.get_ai_response(request.message, history=history)
    return {"response": response_text}

# --- AUTH ENDPOINTS ---
@app.post("/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Signup attempt for email: {user.email}")
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email, 
        hashed_password=hashed_password,
        full_name=user.full_name,
        phone_number=user.phone_number
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"Login attempt for user: {form_data.username}")
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "is_admin": user.is_admin,
            "full_name": user.full_name,
            "phone_number": user.phone_number
        }
    }

@app.post("/forgot-password")
async def forgot_password(
    request: schemas.ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        # Return success even if user not found (security best practice)
        return {"message": "If that email exists, a reset link has been sent."}
    reset_token = auth.get_random_string(32)
    user.reset_token = reset_token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    db.commit()
    reset_link = f"http://localhost:8082/reset-password?token={reset_token}"
    logger.info(f"Password reset link for {request.email}: {reset_link}")
    # Send the real email in the background
    background_tasks.add_task(
        email_utils.send_password_reset_email,
        user_email=request.email,
        reset_link=reset_link
    )
    return {"message": "If that email exists, a reset link has been sent."}

@app.post("/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.reset_token == request.token).first()
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    user.hashed_password = auth.get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Password has been reset successfully."}

# --- IMAGE UPLOAD ENDPOINT ---
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)):
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    url = f"http://127.0.0.1:8000/uploads/{filename}"
    return {"url": url}

# --- VEHICLE ENDPOINTS ---
@app.get("/vehicles", response_model=List[schemas.Vehicle])
def get_vehicles(district: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Vehicle).filter(models.Vehicle.is_approved == True)
    if district:
        query = query.filter(models.Vehicle.district == district)
    return query.all()

@app.get("/vehicles/{vehicle_id}", response_model=schemas.Vehicle)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@app.post("/vehicles", response_model=schemas.Vehicle)
def create_vehicle_public(
    vehicle: schemas.VehicleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_vehicle = models.Vehicle(**vehicle.dict(), owner_id=current_user.id)
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

# --- OWNER VEHICLE ENDPOINTS ---
@app.post("/owner/vehicles", response_model=schemas.Vehicle)
def create_vehicle(
    vehicle: schemas.VehicleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_vehicle = models.Vehicle(**vehicle.dict(), owner_id=current_user.id)
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@app.get("/owner/vehicles", response_model=List[schemas.Vehicle])
def get_owner_vehicles(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Vehicle).filter(models.Vehicle.owner_id == current_user.id).all()

@app.delete("/owner/vehicles/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == vehicle_id,
        models.Vehicle.owner_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found or not owned by you")
    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle deleted successfully"}

@app.patch("/owner/vehicles/{vehicle_id}/status", response_model=schemas.Vehicle)
def update_vehicle_status(
    vehicle_id: int,
    status_update: schemas.VehicleStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == vehicle_id,
        models.Vehicle.owner_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found or not owned by you")
    vehicle.is_available = status_update.is_available
    db.commit()
    db.refresh(vehicle)
    return vehicle

# --- OWNER STATS ENDPOINT ---
@app.get("/owner/stats", response_model=schemas.OwnerStats)
def get_owner_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    vehicles = db.query(models.Vehicle).filter(models.Vehicle.owner_id == current_user.id).all()
    vehicle_ids = [v.id for v in vehicles]

    if not vehicle_ids:
        return schemas.OwnerStats(
            total_cars=0,
            total_bookings=0,
            pending_bookings=0,
            confirmed_bookings=0,
            monthly_revenue=0.0
        )

    bookings = db.query(models.Booking).filter(models.Booking.vehicle_id.in_(vehicle_ids)).all()

    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_revenue = sum(
        b.total_price for b in bookings
        if b.status in ("confirmed", "paid") and b.start_date >= start_of_month
    )

    return schemas.OwnerStats(
        total_cars=len(vehicles),
        total_bookings=len(bookings),
        pending_bookings=sum(1 for b in bookings if b.status == "pending"),
        confirmed_bookings=sum(1 for b in bookings if b.status == "confirmed"),
        monthly_revenue=monthly_revenue
    )

# --- BOOKING ENDPOINTS ---
@app.post("/bookings", response_model=schemas.Booking)
def create_booking(
    booking: schemas.BookingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    vehicle = db.query(models.Vehicle).options(joinedload(models.Vehicle.owner)).filter(
        models.Vehicle.id == booking.vehicle_id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Calculate days
    delta = booking.end_date - booking.start_date
    days = max(1, delta.days)

    total_price = vehicle.price_per_day * days
    if booking.with_driver:
        total_price += vehicle.driver_price_per_day * days

    db_booking = models.Booking(
        **booking.dict(),
        user_id=current_user.id,
        total_price=total_price,
        status="pending"
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    # Notify owner about the new booking
    if vehicle.owner and vehicle.owner.email:
        owner_email = vehicle.owner.email
        vehicle_name = vehicle.name
        start_str = booking.start_date.strftime("%Y-%m-%d")
        end_str = booking.end_date.strftime("%Y-%m-%d")
        background_tasks.add_task(
            email_utils.send_booking_email,
            owner_email=owner_email,
            vehicle_name=vehicle_name,
            start_date=start_str,
            end_date=end_str,
            total_price=total_price
        )

    return db_booking

@app.get("/user/bookings", response_model=List[schemas.Booking])
def get_user_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Booking).options(
        joinedload(models.Booking.vehicle).joinedload(models.Vehicle.owner)
    ).filter(models.Booking.user_id == current_user.id).all()

@app.get("/owner/bookings", response_model=List[schemas.Booking])
def get_owner_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Booking).options(
        joinedload(models.Booking.vehicle),
        joinedload(models.Booking.user)
    ).join(models.Vehicle).filter(
        models.Vehicle.owner_id == current_user.id
    ).order_by(models.Booking.id.desc()).all()

@app.patch("/bookings/{booking_id}", response_model=schemas.Booking)
async def update_booking_status(
    booking_id: int,
    status_update: schemas.BookingStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Fetch booking with related objects loaded eagerly
    booking = db.query(models.Booking).options(
        joinedload(models.Booking.user),
        joinedload(models.Booking.vehicle)
    ).join(models.Vehicle).filter(
        models.Booking.id == booking_id,
        models.Vehicle.owner_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or not owned by you")

    logger.info(f"Status update for booking {booking_id}: {booking.status} -> {status_update.status}")

    # Capture info BEFORE database changes or session commits
    renter_email = booking.user.email if (booking.user and booking.user.email) else None
    vehicle_name = booking.vehicle.name if (booking.vehicle and booking.vehicle.name) else "Vehicle"
    new_status = status_update.status

    if booking.status != new_status:
        booking.status = new_status
        
        if new_status == "picked":
            if booking.vehicle:
                booking.vehicle.is_available = False
        elif new_status == "received":
            if booking.vehicle:
                booking.vehicle.is_available = True

        db.commit()
        db.refresh(booking)

        # Trigger email notification to the renter (user)
        if renter_email:
            logger.info(f"Scheduling notification email to {renter_email} for status: {new_status}")
            background_tasks.add_task(
                email_utils.send_status_update_email,
                user_email=renter_email,
                vehicle_name=vehicle_name,
                status=new_status
            )
        else:
            logger.warning(f"Renter email not found for booking {booking_id}. Cannot send status update email.")

    return booking

@app.post("/bookings/{booking_id}/pay", response_model=schemas.Booking)
def pay_booking(
    booking_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).options(
        joinedload(models.Booking.vehicle),
        joinedload(models.Booking.user)
    ).filter(
        models.Booking.id == booking_id,
        models.Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail="Only confirmed bookings can be paid")
    
    booking.status = "paid"
    db.commit()
    db.refresh(booking)
    
    # Send Receipt Email in Background
    if booking.user and booking.user.email:
        background_tasks.add_task(
            email_utils.send_payment_receipt_email,
            user_email=booking.user.email,
            vehicle_name=booking.vehicle.name if booking.vehicle else "Vehicle Rental",
            amount=booking.total_price,
            booking_id=booking.id
        )
        
    return booking

# --- SAFETY LOG ENDPOINTS ---
@app.post("/bookings/{booking_id}/safety-logs", response_model=schemas.SafetyLog)
def create_safety_log(
    booking_id: int,
    log: schemas.SafetyLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id,
        models.Booking.user_id == current_user.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or not yours")

    db_log = models.SafetyLog(
        booking_id=booking_id,
        photo_url=log.photo_url,
        condition_type=log.condition_type,
        note=log.note
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/bookings/{booking_id}/safety-logs", response_model=List[schemas.SafetyLog])
def get_safety_logs(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    is_renter = booking.user_id == current_user.id
    is_owner = booking.vehicle.owner_id == current_user.id if booking.vehicle else False

    if not (is_renter or is_owner):
        raise HTTPException(status_code=403, detail="Not authorized to view these logs")

    logs = db.query(models.SafetyLog).filter(
        models.SafetyLog.booking_id == booking_id
    ).order_by(models.SafetyLog.created_at.desc()).all()
    return logs

@app.patch("/bookings/{booking_id}/safety-logs/read")
def mark_safety_logs_read(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking or (booking.vehicle and booking.vehicle.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    db.query(models.SafetyLog).filter(
        models.SafetyLog.booking_id == booking_id,
        models.SafetyLog.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "Logs marked as read"}

# --- ADMIN ENDPOINTS ---
@app.get("/admin/stats", response_model=schemas.OwnerStats)
def get_global_stats(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    total_cars = db.query(models.Vehicle).count()
    total_bookings = db.query(models.Booking).count()
    pending = db.query(models.Booking).filter(models.Booking.status == "pending").count()
    confirmed = db.query(models.Booking).filter(models.Booking.status == "confirmed").count()
    
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_revenue_bookings = db.query(models.Booking).filter(
        models.Booking.status.in_(["confirmed", "paid", "picked", "received"]),
        models.Booking.start_date >= start_of_month
    ).all()
    monthly_revenue = sum(b.total_price for b in monthly_revenue_bookings)

    return schemas.OwnerStats(
        total_cars=total_cars,
        total_bookings=total_bookings,
        pending_bookings=pending,
        confirmed_bookings=confirmed,
        monthly_revenue=monthly_revenue
    )

@app.get("/admin/bookings", response_model=List[schemas.Booking])
def get_all_bookings(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    return db.query(models.Booking).options(
        joinedload(models.Booking.vehicle),
        joinedload(models.Booking.user)
    ).order_by(models.Booking.id.desc()).all()

@app.patch("/admin/bookings/{booking_id}/status", response_model=schemas.Booking)
async def admin_update_booking_status(
    booking_id: int,
    status_update: schemas.BookingStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    booking = db.query(models.Booking).options(
        joinedload(models.Booking.user),
        joinedload(models.Booking.vehicle)
    ).filter(models.Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    new_status = status_update.status

    if booking.status != new_status:
        booking.status = new_status
        
        if new_status == "picked":
            if booking.vehicle:
                booking.vehicle.is_available = False
        elif new_status == "received":
            if booking.vehicle:
                booking.vehicle.is_available = True

        db.commit()
        db.refresh(booking)

        if booking.user and booking.user.email:
            background_tasks.add_task(
                email_utils.send_status_update_email,
                user_email=booking.user.email,
                vehicle_name=booking.vehicle.name if booking.vehicle else "Vehicle",
                status=new_status
            )

    return booking

@app.get("/admin/vehicles", response_model=List[schemas.Vehicle])
def get_all_vehicles(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    return db.query(models.Vehicle).order_by(models.Vehicle.id.desc()).all()

@app.patch("/admin/vehicles/{vehicle_id}/approve", response_model=schemas.Vehicle)
def approve_vehicle(
    vehicle_id: int,
    approval: schemas.VehicleApprovalUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle.is_approved = approval.is_approved
    db.commit()
    db.refresh(vehicle)
    return vehicle

# --- STRIPE PAYMENT ENDPOINTS ---
@app.post("/create-checkout-session/{booking_id}")
async def create_checkout_session(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).options(joinedload(models.Booking.vehicle)).filter(
        models.Booking.id == booking_id,
        models.Booking.user_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail="Only confirmed bookings can be paid")

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'lkr',
                    'product_data': {
                        'name': f"Rental: {booking.vehicle.name}",
                        'description': f"From {booking.start_date.date()} to {booking.end_date.date()}",
                    },
                    'unit_amount': int(booking.total_price * 100), # Stripe expects cents/cents-equivalent
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"http://localhost:8080/checkout/{booking_id}?success=true",
            cancel_url=f"http://localhost:8080/checkout/{booking_id}?canceled=true",
            metadata={
                "booking_id": str(booking.id),
                "user_email": current_user.email
            }
        )
        return {"id": checkout_session.id, "url": checkout_session.url}
    except Exception as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook/stripe")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        return HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        return HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        booking_id_str = session.get("metadata", {}).get("booking_id")
        
        if booking_id_str:
            booking_id = int(booking_id_str)
            # Eager load related data for the receipt
            booking = db.query(models.Booking).options(
                joinedload(models.Booking.vehicle),
                joinedload(models.Booking.user)
            ).filter(models.Booking.id == booking_id).first()
            
            if booking:
                booking.status = "paid"
                db.commit()
                logger.info(f"Booking {booking_id} marked as PAID via Stripe Webhook")
                
                # Send Receipt Email in Background
                if booking.user and booking.user.email:
                    background_tasks.add_task(
                        email_utils.send_payment_receipt_email,
                        user_email=booking.user.email,
                        vehicle_name=booking.vehicle.name if booking.vehicle else "Vehicle Rental",
                        amount=booking.total_price,
                        booking_id=booking.id
                    )

    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
