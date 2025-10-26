from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import Course, Course_Pydantic, CourseIn_Pydantic

router = APIRouter()


@router.get("/", response_model=List[Course_Pydantic])
async def get_courses(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None
):
    query = Course.all()
    
    if category:
        query = query.filter(category=category)
    if difficulty:
        query = query.filter(difficulty=difficulty)
    if search:
        query = query.filter(title__icontains=search) | query.filter(description__icontains=search)
    
    courses = await query
    return [Course_Pydantic.model_validate(course) for course in courses]


@router.get("/{course_id}", response_model=Course_Pydantic)
async def get_course(course_id: int):
    course = await Course.get_or_none(id=course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course_Pydantic.model_validate(course)


@router.post("/", response_model=Course_Pydantic)
async def create_course(course: CourseIn_Pydantic):
    course_obj = await Course.create(**course.model_dump(exclude_unset=True))
    return Course_Pydantic.model_validate(course_obj)


@router.get("/categories/list")
async def get_categories():
    courses = await Course.all()
    categories = list(set([course.category for course in courses]))
    return {"categories": sorted(categories)}
