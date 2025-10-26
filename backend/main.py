from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise import Tortoise
from contextlib import asynccontextmanager
import os

from api import courses, students, enrollments, chat
from database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Tortoise ORM
    await Tortoise.init(
        db_url=os.getenv("DATABASE_URL", "postgres://lms_user:lms_password@postgres:5432/lms_db"),
        modules={"models": ["models"]}
    )
    # Generate schemas
    await Tortoise.generate_schemas()
    
    # Initialize database with sample data
    await init_db()
    
    yield
    
    # Close connections
    await Tortoise.close_connections()


app = FastAPI(
    title="LMS Platform API",
    description="AI-Powered Learning Management System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(enrollments.router, prefix="/api/enrollments", tags=["Enrollments"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.get("/")
async def root():
    return {"message": "LMS Platform API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
