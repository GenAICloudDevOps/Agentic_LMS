from tortoise import fields, models
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class Student(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    email = fields.CharField(max_length=255, unique=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    
    enrollments: fields.ReverseRelation["Enrollment"]

    class Meta:
        table = "students"


class Course(models.Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=255)
    description = fields.TextField()
    category = fields.CharField(max_length=100)
    difficulty = fields.CharField(max_length=50)
    duration_hours = fields.IntField()
    created_at = fields.DatetimeField(auto_now_add=True)
    
    enrollments: fields.ReverseRelation["Enrollment"]

    class Meta:
        table = "courses"


class Enrollment(models.Model):
    id = fields.IntField(pk=True)
    student = fields.ForeignKeyField("models.Student", related_name="enrollments")
    course = fields.ForeignKeyField("models.Course", related_name="enrollments")
    enrolled_at = fields.DatetimeField(auto_now_add=True)
    progress = fields.IntField(default=0)
    completed = fields.BooleanField(default=False)

    class Meta:
        table = "enrollments"
        unique_together = (("student", "course"),)


class ChatHistory(models.Model):
    id = fields.IntField(pk=True)
    student = fields.ForeignKeyField("models.Student", related_name="chats", null=True)
    message = fields.TextField()
    response = fields.TextField()
    model_used = fields.CharField(max_length=100)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "chat_history"


# Pydantic models for API
class Student_Pydantic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    email: str
    created_at: datetime


class StudentIn_Pydantic(BaseModel):
    name: str
    email: str


class Course_Pydantic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    description: str
    category: str
    difficulty: str
    duration_hours: int
    created_at: datetime


class CourseIn_Pydantic(BaseModel):
    title: str
    description: str
    category: str
    difficulty: str
    duration_hours: int


class Enrollment_Pydantic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    student_id: int
    course_id: int
    enrolled_at: datetime
    progress: int
    completed: bool
