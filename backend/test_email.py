import asyncio
import os
from dotenv import load_dotenv
from email_service import send_course_enrollment_email

# Load environment variables
load_dotenv()

async def test_email():
    print("Testing email configuration...")
    print(f"GMAIL_EMAIL: {os.getenv('GMAIL_EMAIL')}")
    print(f"GMAIL_APP_PASSWORD: {'*' * len(os.getenv('GMAIL_APP_PASSWORD', ''))}")
    print(f"ADMIN_EMAIL: {os.getenv('ADMIN_EMAIL')}")
    
    # Test data
    test_enrollment = {
        "enrollment_id": 999,
        "student_name": "Test Student",
        "student_email": "test@example.com",
        "course_title": "Test Course",
        "course_category": "Testing",
        "course_difficulty": "Beginner"
    }
    
    print("\nSending test email...")
    await send_course_enrollment_email(test_enrollment)
    print("Test completed!")

if __name__ == "__main__":
    asyncio.run(test_email())
