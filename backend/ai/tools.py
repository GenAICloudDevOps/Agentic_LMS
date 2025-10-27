from models import Course, Student, Enrollment
from typing import Optional, List, Dict


async def get_courses_tool(category: Optional[str] = None) -> List[Dict]:
    """Get all courses or filter by category"""
    query = Course.all()
    if category:
        query = query.filter(category=category)
    
    courses = await query
    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "difficulty": c.difficulty,
            "duration_hours": c.duration_hours
        }
        for c in courses
    ]


async def search_courses_tool(query: str) -> List[Dict]:
    """Search courses by title or description"""
    courses = await Course.filter(
        title__icontains=query
    ) | Course.filter(
        description__icontains=query
    )
    
    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "difficulty": c.difficulty
        }
        for c in courses
    ]


async def enroll_student_tool(student_id: int, course_id: int) -> Dict:
    """Enroll a student in a course"""
    from email_service import send_course_enrollment_email
    
    student = await Student.get_or_none(id=student_id)
    if not student:
        return {"success": False, "error": "Student not found"}
    
    course = await Course.get_or_none(id=course_id)
    if not course:
        return {"success": False, "error": "Course not found"}
    
    existing = await Enrollment.get_or_none(
        student_id=student_id,
        course_id=course_id
    )
    if existing:
        return {"success": False, "error": "Already enrolled"}
    
    enrollment_obj = await Enrollment.create(student_id=student_id, course_id=course_id)
    
    # Send email and Slack notifications (non-blocking, won't fail enrollment)
    try:
        enrollment_data = {
            "enrollment_id": enrollment_obj.id,
            "student_name": student.name,
            "student_email": student.email,
            "course_title": course.title,
            "course_category": course.category,
            "course_difficulty": course.difficulty
        }
        await send_course_enrollment_email(enrollment_data)
    except Exception as e:
        print(f"Notification failed but enrollment created successfully: {e}")
    
    return {
        "success": True,
        "message": f"Successfully enrolled in {course.title}"
    }
