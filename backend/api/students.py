from fastapi import APIRouter, HTTPException
from typing import List
from models import Student, Student_Pydantic, StudentIn_Pydantic

router = APIRouter()


@router.get("/", response_model=List[Student_Pydantic])
async def get_students():
    students = await Student.all()
    return [Student_Pydantic.model_validate(s) for s in students]


@router.get("/{student_id}", response_model=Student_Pydantic)
async def get_student(student_id: int):
    student = await Student.get_or_none(id=student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return Student_Pydantic.model_validate(student)


@router.post("/", response_model=Student_Pydantic)
async def create_student(student: StudentIn_Pydantic):
    existing = await Student.get_or_none(email=student.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    student_obj = await Student.create(**student.model_dump(exclude_unset=True))
    return Student_Pydantic.model_validate(student_obj)


@router.post("/login", response_model=Student_Pydantic)
async def login_student(email: str):
    student = await Student.get_or_none(email=email)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found with this email")
    return Student_Pydantic.model_validate(student)


@router.get("/{student_id}/enrollments")
async def get_student_enrollments(student_id: int):
    student = await Student.get_or_none(id=student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    enrollments = await student.enrollments.all().prefetch_related('course')
    
    return {
        "student_id": student_id,
        "enrollments": [
            {
                "id": e.id,
                "course": {
                    "id": e.course.id,
                    "title": e.course.title,
                    "category": e.course.category,
                    "difficulty": e.course.difficulty
                },
                "enrolled_at": e.enrolled_at,
                "progress": e.progress,
                "completed": e.completed
            }
            for e in enrollments
        ]
    }
