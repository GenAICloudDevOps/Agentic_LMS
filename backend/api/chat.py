from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ai.agent import LMSAgent
from models import ChatHistory, Student

router = APIRouter()
lms_agent = LMSAgent()


class ChatRequest(BaseModel):
    message: str
    student_id: Optional[int] = None
    model: str = "gemini-2.5-flash-lite"


class ChatResponse(BaseModel):
    response: str
    model_used: str
    suggestions: Optional[list] = None
    enrolled: bool = False


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response = await lms_agent.process_message(
            message=request.message,
            model=request.model,
            student_id=request.student_id
        )
        
        if request.student_id:
            student = await Student.get_or_none(id=request.student_id)
            if student:
                await ChatHistory.create(
                    student=student,
                    message=request.message,
                    response=response["response"],
                    model_used=request.model
                )
        
        return ChatResponse(**response)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.get("/models")
async def get_available_models():
    return {
        "models": [
            {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "provider": "Google"},
            {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": "Google"},
            {"id": "gemini-2.5-flash-lite", "name": "Gemini 2.5 Flash Lite", "provider": "Google"},
            {"id": "bedrock-nova", "name": "Amazon Nova", "provider": "AWS Bedrock"},
            {"id": "bedrock-sonnet", "name": "Claude Sonnet", "provider": "AWS Bedrock"},
            {"id": "mistral", "name": "Mistral", "provider": "Mistral AI"}
        ],
        "default": "gemini-2.5-flash-lite"
    }


@router.get("/history/{student_id}")
async def get_chat_history(student_id: int, limit: int = 20):
    student = await Student.get_or_none(id=student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    history = await ChatHistory.filter(student=student).order_by("-created_at").limit(limit)
    
    return {
        "history": [
            {
                "message": h.message,
                "response": h.response,
                "model": h.model_used,
                "timestamp": h.created_at
            }
            for h in history
        ]
    }
