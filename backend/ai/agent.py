from typing import Optional, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from ai.models import get_model
from ai.tools import get_courses_tool, enroll_student_tool, search_courses_tool
import json
import re


class AgentState(Dict[str, Any]):
    messages: list
    student_id: Optional[int]
    context: Dict[str, Any]


class LMSAgent:
    def __init__(self):
        self.tools = {
            "get_courses": get_courses_tool,
            "search_courses": search_courses_tool,
            "enroll_student": enroll_student_tool
        }
    
    async def process_message(
        self,
        message: str,
        model: str = "gemini-2.5-flash-lite",
        student_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Process user message and return AI response"""
        
        llm = get_model(model)
        
        # Check if user wants to enroll
        enrollment_result = None
        if student_id:
            enrollment_result = await self._check_enrollment_intent(message, student_id)
        
        system_prompt = """You are an AI assistant for a Learning Management System specializing in AI, DevOps, Docker, and Kubernetes courses.

Your role:
- Help students discover relevant courses
- Provide course recommendations based on their interests and skill level
- Answer questions about course content, difficulty, and duration
- Assist with course enrollment
- Be friendly, helpful, and encouraging

Available courses cover: AI/Machine Learning, DevOps, Docker, and Kubernetes
Difficulty levels: Beginner, Intermediate, Advanced

When recommending courses, consider the student's background and goals.
When a student says "enroll me" or "I want to enroll" or "yes" to a course suggestion, confirm the enrollment."""

        full_prompt = f"{system_prompt}\n\nStudent: {message}\n\nAssistant:"
        
        try:
            response_text = await self._get_llm_response(llm, full_prompt, model)
            
            # If enrollment happened, add confirmation to response
            if enrollment_result and enrollment_result.get("success"):
                response_text = f"✅ {enrollment_result['message']}\n\n{response_text}"
            elif enrollment_result and not enrollment_result.get("success"):
                response_text = f"❌ {enrollment_result.get('error', 'Enrollment failed')}\n\n{response_text}"
            
            suggestions = await self._generate_suggestions(message, enrollment_result)
            
            return {
                "response": response_text,
                "model_used": model,
                "suggestions": suggestions,
                "enrolled": enrollment_result.get("success", False) if enrollment_result else False
            }
        
        except Exception as e:
            return {
                "response": f"I apologize, but I encountered an error: {str(e)}. Please try again.",
                "model_used": model,
                "suggestions": [],
                "enrolled": False
            }
    
    async def _check_enrollment_intent(self, message: str, student_id: int) -> Optional[Dict[str, Any]]:
        """Check if user wants to enroll and process enrollment"""
        message_lower = message.lower()
        
        # Check for enrollment keywords
        enrollment_keywords = ["enroll", "sign up", "register", "join", "take this course", "yes", "ok", "sure"]
        if not any(keyword in message_lower for keyword in enrollment_keywords):
            return None
        
        # Search for course mentions
        courses = await get_courses_tool()
        
        for course in courses:
            course_title_lower = course["title"].lower()
            # Check if course title or keywords are in message
            if (course_title_lower in message_lower or 
                any(word in message_lower for word in course_title_lower.split()[:3])):
                # Try to enroll
                result = await enroll_student_tool(student_id, course["id"])
                return result
        
        # If "yes" or "ok" without specific course, try to find last mentioned category
        if any(word in message_lower for word in ["yes", "ok", "sure"]):
            # Try to enroll in first beginner course as default
            for course in courses:
                if course["difficulty"] == "Beginner":
                    result = await enroll_student_tool(student_id, course["id"])
                    return result
        
        return None
    
    async def _get_llm_response(self, llm, prompt: str, model: str) -> str:
        """Get response from LLM based on model type"""
        
        if model.startswith("gemini"):
            # Using direct Google Generative AI SDK
            response = llm.generate_content(prompt)
            return response.text
        
        elif model.startswith("bedrock"):
            response = llm.invoke(prompt)
            return response.content if hasattr(response, 'content') else str(response)
        
        elif model == "mistral":
            response = llm.invoke(prompt)
            return response.content if hasattr(response, 'content') else str(response)
        
        else:
            return "Model not supported"
    
    async def _generate_suggestions(self, message: str, enrollment_result: Optional[Dict] = None) -> list:
        """Generate follow-up suggestions based on message"""
        
        message_lower = message.lower()
        
        # If just enrolled, suggest next steps
        if enrollment_result and enrollment_result.get("success"):
            return [
                "Show my enrollments",
                "What other courses do you recommend?",
                "Tell me about the course content"
            ]
        
        if any(word in message_lower for word in ["ai", "machine learning", "ml"]):
            return [
                "Show me beginner AI courses",
                "Enroll me in Introduction to AI",
                "What are the prerequisites for ML?"
            ]
        elif any(word in message_lower for word in ["devops", "ci/cd", "automation"]):
            return [
                "Tell me about DevOps courses",
                "Enroll me in DevOps Fundamentals",
                "What tools will I learn?"
            ]
        elif "docker" in message_lower:
            return [
                "Show Docker courses",
                "Enroll me in Docker Mastery",
                "What's the difference between Docker and Kubernetes?"
            ]
        elif "kubernetes" in message_lower or "k8s" in message_lower:
            return [
                "Show Kubernetes courses",
                "Enroll me in Kubernetes for Developers",
                "Do I need Docker knowledge first?"
            ]
        elif any(word in message_lower for word in ["enroll", "sign up", "register"]):
            return [
                "Show all courses",
                "What do you recommend for beginners?",
                "Show my enrollments"
            ]
        else:
            return [
                "What courses do you offer?",
                "Show me beginner courses",
                "I want to learn AI and DevOps"
            ]
