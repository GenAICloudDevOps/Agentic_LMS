import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


async def send_admin_enrollment_notification(enrollment_data: dict):
    """
    Send email notification to admin when a student enrolls in a course
    
    Args:
        enrollment_data: Dictionary containing enrollment information (student, course)
    """
    try:
        gmail_email = os.getenv("GMAIL_EMAIL")
        gmail_password = os.getenv("GMAIL_APP_PASSWORD")
        admin_email = os.getenv("ADMIN_EMAIL")
        
        if not all([gmail_email, gmail_password, admin_email]):
            print("⚠️ Email configuration missing. Skipping admin notification.")
            return
        
        message = MIMEMultipart("alternative")
        message["Subject"] = f"🎓 New Enrollment: {enrollment_data['student_name']} enrolled in {enrollment_data['course_title']}"
        message["From"] = gmail_email
        message["To"] = admin_email
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                        🎓 New Course Enrollment
                    </h2>
                    
                    <div style="margin: 20px 0;">
                        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <h3 style="color: #1976D2; margin: 0 0 10px 0;">Student Information</h3>
                            <p style="margin: 5px 0;"><strong>Name:</strong> {enrollment_data['student_name']}</p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> {enrollment_data['student_email']}</p>
                        </div>
                        
                        <div style="background-color: #f3e5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <h3 style="color: #7B1FA2; margin: 0 0 10px 0;">Course Information</h3>
                            <p style="margin: 5px 0;"><strong>Title:</strong> {enrollment_data['course_title']}</p>
                            <p style="margin: 5px 0;"><strong>Category:</strong> {enrollment_data['course_category']}</p>
                            <p style="margin: 5px 0;"><strong>Difficulty:</strong> {enrollment_data['course_difficulty']}</p>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Enrollment ID:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{enrollment_data['enrollment_id']}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;"><strong>Enrolled At:</strong></td>
                                <td style="padding: 8px;">{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                        <p>This is an automated notification from your LMS Platform.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        await aiosmtplib.send(
            message,
            hostname="smtp.gmail.com",
            port=587,
            start_tls=True,
            username=gmail_email,
            password=gmail_password,
        )
        
        print(f"✅ Admin notification sent successfully to {admin_email}")
        
    except Exception as e:
        print(f"❌ Failed to send admin notification: {str(e)}")


async def send_student_welcome_email(enrollment_data: dict):
    """
    Send welcome email to student when they enroll in a course
    
    Args:
        enrollment_data: Dictionary containing enrollment information (student, course)
    """
    try:
        gmail_email = os.getenv("GMAIL_EMAIL")
        gmail_password = os.getenv("GMAIL_APP_PASSWORD")
        student_email = enrollment_data['student_email']
        
        if not all([gmail_email, gmail_password, student_email]):
            print("⚠️ Email configuration missing. Skipping student welcome email.")
            return
        
        message = MIMEMultipart("alternative")
        message["Subject"] = f"🎉 Welcome to {enrollment_data['course_title']}!"
        message["From"] = gmail_email
        message["To"] = student_email
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">
                        🎉 Welcome to Your New Course!
                    </h2>
                    
                    <div style="margin: 20px 0;">
                        <p style="font-size: 16px;">Hi <strong>{enrollment_data['student_name']}</strong>,</p>
                        
                        <p style="font-size: 16px;">Congratulations! You've successfully enrolled in:</p>
                        
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; color: white; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0; color: white;">{enrollment_data['course_title']}</h3>
                            <p style="margin: 5px 0; opacity: 0.9;">📚 Category: {enrollment_data['course_category']}</p>
                            <p style="margin: 5px 0; opacity: 0.9;">⭐ Difficulty: {enrollment_data['course_difficulty']}</p>
                        </div>
                        
                        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3; margin: 20px 0;">
                            <h4 style="margin: 0 0 10px 0; color: #1976D2;">🚀 What's Next?</h4>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Access your course materials anytime</li>
                                <li>Track your progress as you learn</li>
                                <li>Use our AI assistant for help</li>
                                <li>Complete the course at your own pace</li>
                            </ul>
                        </div>
                        
                        <p style="font-size: 16px; margin: 20px 0;">We're excited to have you on this learning journey! If you have any questions, feel free to reach out.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <p style="font-size: 18px; color: #4CAF50; font-weight: bold;">Happy Learning! 📖✨</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                        <p>This is an automated message from your LMS Platform.</p>
                        <p>Enrollment ID: {enrollment_data['enrollment_id']} | Enrolled: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        await aiosmtplib.send(
            message,
            hostname="smtp.gmail.com",
            port=587,
            start_tls=True,
            username=gmail_email,
            password=gmail_password,
        )
        
        print(f"✅ Welcome email sent successfully to {student_email}")
        
    except Exception as e:
        print(f"❌ Failed to send welcome email to student: {str(e)}")


async def send_course_enrollment_email(enrollment_data: dict):
    """
    Send enrollment notifications to both admin and student
    
    Args:
        enrollment_data: Dictionary containing enrollment information (student, course)
    """
    # Send both emails concurrently
    await send_admin_enrollment_notification(enrollment_data)
    await send_student_welcome_email(enrollment_data)
