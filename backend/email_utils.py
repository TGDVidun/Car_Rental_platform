import os
import logging
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv

load_dotenv()

# Logger for email operations
logger = logging.getLogger("email_utils")

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "RentX Support"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True").lower() == "true",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False").lower() == "true",
    USE_CREDENTIALS=os.getenv("USE_CREDENTIALS", "True").lower() == "true",
    VALIDATE_CERTS=os.getenv("VALIDATE_CERTS", "True").lower() == "true"
)

async def send_booking_email(owner_email: str, vehicle_name: str, start_date: str, end_date: str, total_price: float):
    """
    Sends an email notification to the vehicle owner when a new booking is made.
    """
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">New Booking Alert!</h2>
            <p>Hello,</p>
            <p>You have a new booking request for your vehicle: <strong>{vehicle_name}</strong>.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Rental Period:</strong> {start_date} to {end_date}</p>
                <p style="margin: 5px 0;"><strong>Estimated Earnings:</strong> LKR {total_price:,.2f}</p>
            </div>
            <p>Please log in to your RentX dashboard to approve or decline this request.</p>
            <a href="http://127.0.0.1:5173/admin/bookings" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage Bookings</a>
            <p style="font-size: 0.8rem; color: #777; margin-top: 30px;">This is an automated notification from <span style="font-weight: bold;">RentX</span>. No need to reply.</p>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject=f"New Booking Request: {vehicle_name}",
        recipients=[owner_email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logger.info(f"SUCCESS: Booking notification email sent to {owner_email} for {vehicle_name}")
    except Exception as e:
        logger.error(f"FAILURE: Could not send booking notification to {owner_email}: {str(e)}")
        # In development, we might not have valid credentials, so we'll just log the error
        # but won't crash the booking process.

async def send_status_update_email(user_email: str, vehicle_name: str, status: str):
    """
    Sends an email notification to the renter when their booking status changes.
    """
    color = "#16a34a" if status.lower() == "confirmed" else "#dc2626"
    status_text = "Approved" if status.lower() == "confirmed" else "Declined"
    
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: {color};">Booking {status_text}!</h2>
            <p>Hello,</p>
            <p>The owner has <strong>{status_text.lower()}</strong> your booking request for the vehicle: <strong>{vehicle_name}</strong>.</p>
            {"<p>Please log in to your account and navigate to 'My Bookings' to complete the payment for this reservation.</p>" if status.lower() == "confirmed" else "<p>We apologize for the inconvenience. You can browse other available vehicles on our platform.</p>"}
            <a href="http://127.0.0.1:5173/bookings" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">View My Bookings</a>
            <p style="font-size: 0.8rem; color: #777; margin-top: 30px;">This is an automated notification from <span style="font-weight: bold;">RentX</span>. No need to reply.</p>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject=f"Booking {status_text}: {vehicle_name}",
        recipients=[user_email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logger.info(f"SUCCESS: Status update email ({status_text}) sent to {user_email} for {vehicle_name}")
    except Exception as e:
        logger.error(f"FAILURE: Could not send status update email to {user_email}: {str(e)}")

async def send_password_reset_email(user_email: str, reset_link: str):
    """
    Sends a password reset email with a secure link.
    """
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; border: 1px solid #eee;">
            <h2 style="color: #f97316; margin-bottom: 4px;">RentX</h2>
            <h3 style="color: #1e293b; margin-top: 0;">Password Reset Request</h3>
            <p>Hello,</p>
            <p>We received a request to reset the password for your <strong>RentX</strong> account associated with this email address.</p>
            <p>Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="display: inline-block; padding: 14px 28px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Reset My Password
                </a>
            </div>
            <p style="color: #64748b; font-size: 0.9rem;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.8rem; color: #94a3b8;">This is an automated message from <strong>RentX</strong>. Please do not reply to this email.</p>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="Reset Your RentX Password",
        recipients=[user_email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logger.info(f"SUCCESS: Password reset email sent to {user_email}")
    except Exception as e:
        logger.error(f"FAILURE: Could not send password reset email to {user_email}: {str(e)}")
        raise  # Re-raise so the endpoint knows it failed

async def send_payment_receipt_email(user_email: str, vehicle_name: str, amount: float, booking_id: int):
    """
    Sends a professional payment receipt email to the user.
    """
    from datetime import datetime
    html = f"""
    <html>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0; font-size: 28px; letter-spacing: -1px;">RentX Receipt</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Thank you for your payment!</p>
            </div>
            
            <div style="border-top: 2px solid #f1f5f9; border-bottom: 2px solid #f1f5f9; padding: 25px 0; margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="color: #64748b;">Booking ID:</span>
                    <span style="font-weight: 600; color: #0f172a;">#RX-{booking_id:05d}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="color: #64748b;">Vehicle:</span>
                    <span style="font-weight: 600; color: #0f172a;">{vehicle_name}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="color: #64748b;">Date:</span>
                    <span style="font-weight: 600; color: #0f172a;">{datetime.now().strftime("%B %d, %Y")}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 1px dashed #e2e8f0;">
                    <span style="font-size: 18px; font-weight: 700; color: #0f172a;">Total Amount Paid</span>
                    <span style="font-size: 18px; font-weight: 700; color: #2563eb;">LKR {amount:,.2f}</span>
                </div>
            </div>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: 500;">Next Steps:</p>
                <p style="margin: 5px 0 0; font-size: 13px; color: #1e40af;">You can now view the owner's contact details in your 'My Bookings' dashboard to coordinate the vehicle pickup.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="http://localhost:5173/bookings" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">View My Booking</a>
            </div>
            
            <div style="margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <p style="font-size: 12px; color: #94a3b8; margin: 0;">RentX Sri Lanka - Premium Vehicle Rentals</p>
                <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0;">If you have any questions, contact us at support@rentx.lk</p>
            </div>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject=f"Payment Receipt: Booking #RX-{booking_id:05d}",
        recipients=[user_email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logger.info(f"SUCCESS: Payment receipt email sent to {user_email} for booking {booking_id}")
    except Exception as e:
        logger.error(f"FAILURE: Could not send payment receipt to {user_email}: {str(e)}")
