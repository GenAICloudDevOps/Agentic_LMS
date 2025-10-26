from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models import Enrollment, Student, Course

router = APIRouter()


class EnrollmentCreate(BaseModel):
    student_id: int
    course_id: int


class EnrollmentUpdate(BaseModel):
    progress: int
    completed: bool = False


@router.post("/")
async def create_enrollment(enrollment: EnrollmentCreate):
    student = await Student.get_or_none(id=enrollment.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    course = await Course.get_or_none(id=enrollment.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    existing = await Enrollment.get_or_none(
        student_id=enrollment.student_id,
        course_id=enrollment.course_id
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    enrollment_obj = await Enrollment.create(
        student_id=enrollment.student_id,
        course_id=enrollment.course_id
    )
    
    return {
        "id": enrollment_obj.id,
        "student_id": enrollment_obj.student_id,
        "course_id": enrollment_obj.course_id,
        "enrolled_at": enrollment_obj.enrolled_at,
        "message": "Successfully enrolled in course"
    }


@router.patch("/{enrollment_id}")
async def update_enrollment(enrollment_id: int, update: EnrollmentUpdate):
    enrollment = await Enrollment.get_or_none(id=enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    enrollment.progress = update.progress
    enrollment.completed = update.completed
    await enrollment.save()
    
    return {"message": "Enrollment updated successfully"}
