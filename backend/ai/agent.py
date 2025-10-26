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
        
        # Get actual courses from database
        courses = await get_courses_tool()
        
        # Format courses for the prompt
        courses_list = "\n".join([
            f"- {course['title']} ({course['difficulty']}, {course['duration_hours']}h) - {course['description']}"
            for course in courses
        ])
        
        # Get recent chat history for context
        conversation_context = ""
        if student_id:
            conversation_context = await self._get_recent_context(student_id)
        
        system_prompt = f"""You are an AI assistant for a Learning Management System specializing in AI, DevOps, Docker, and Kubernetes courses.

Your role:
- Help students discover relevant courses
- Provide course recommendations based on their interests and skill level
- Answer questions about course content, difficulty, and duration
- Assist with course enrollment
- Be friendly, helpful, and encouraging

IMPORTANT: Only recommend courses from the list below. Do not make up or suggest courses that are not in this list.

AVAILABLE COURSES:
{courses_list}

When recommending courses, consider the student's background and goals.
If a student wants to enroll in a course, respond naturally but DO NOT confirm enrollment in your response - the system will handle that automatically.
Always use the exact course titles from the list above.

IMPORTANT: When a student says "enroll me", "enroll for both", "enroll all", "sign me up", etc., you should respond by asking them to specify the exact course title(s) they want to enroll in, OR if they just mentioned specific courses in the conversation, acknowledge their interest. The enrollment will be processed automatically if course names are detected."""

        full_prompt = f"{system_prompt}\n\n{conversation_context}Student: {message}\n\nAssistant:"
        
        try:
            response_text = await self._get_llm_response(llm, full_prompt, model)
            
            # Check if user wants to enroll AFTER getting LLM response
            # Pass conversation context to help detect courses from previous messages
            enrollment_results = []
            if student_id:
                enrollment_results = await self._check_enrollment_intent(message, student_id, courses, conversation_context)
            
            # If enrollments happened, add confirmations to response
            if enrollment_results:
                enrollment_messages = []
                any_success = False
                for result in enrollment_results:
                    if result.get("success"):
                        enrollment_messages.append(f"✅ {result['message']}")
                        any_success = True
                    else:
                        enrollment_messages.append(f"❌ {result.get('error', 'Enrollment failed')}")
                
                if enrollment_messages:
                    response_text = "\n".join(enrollment_messages) + "\n\n" + response_text
            
            suggestions = await self._generate_suggestions(message, enrollment_results)
            
            return {
                "response": response_text,
                "model_used": model,
                "suggestions": suggestions,
                "enrolled": any_success if enrollment_results else False
            }
        
        except Exception as e:
            return {
                "response": f"I apologize, but I encountered an error: {str(e)}. Please try again.",
                "model_used": model,
                "suggestions": [],
                "enrolled": False
            }
    
    async def _get_recent_context(self, student_id: int) -> str:
        """Get recent chat history for context"""
        from models import ChatHistory, Student
        
        student = await Student.get_or_none(id=student_id)
        if not student:
            return ""
        
        # Get last 3 messages for context
        history = await ChatHistory.filter(student=student).order_by("-created_at").limit(3)
        
        if not history:
            return ""
        
        # Format history (reverse to chronological order)
        context_parts = []
        for h in reversed(history):
            context_parts.append(f"Student: {h.message}")
            context_parts.append(f"Assistant: {h.response}")
        
        return "\n".join(context_parts) + "\n\n"
    
    async def _check_enrollment_intent(self, message: str, student_id: int, courses: list, context: str = "") -> list:
        """Check if user wants to enroll and process enrollment(s)"""
        message_lower = message.lower()
        
        # Check for enrollment keywords or affirmative responses
        enrollment_keywords = ["enroll", "sign up", "register", "join", "take this course", "take the course", "i want"]
        affirmative_keywords = ["yes", "yeah", "yep", "sure", "ok", "okay"]
        
        has_enrollment_intent = any(keyword in message_lower for keyword in enrollment_keywords)
        is_affirmative = any(keyword == message_lower.strip() or keyword in message_lower.split() for keyword in affirmative_keywords)
        
        if not (has_enrollment_intent or is_affirmative):
            return []
        
        enrollment_results = []
        courses_to_enroll = []
        
        # Combine message and recent context for better course detection
        search_text = message_lower + " " + context.lower()
        
        # Search for specific course mentions in the message
        for course in courses:
            course_title_lower = course["title"].lower()
            course_category = course["category"].lower()
            course_difficulty = course["difficulty"].lower()
            
            # Check if full course title is mentioned
            if course_title_lower in message_lower:
                courses_to_enroll.append(course)
                continue
            
            # Check for category + difficulty combination (e.g., "kubernetes intermediate")
            if course_category in message_lower and course_difficulty in message_lower:
                courses_to_enroll.append(course)
                continue
            
            # Check if significant keywords from course title are in message
            # Use first 3 meaningful words (excluding common words)
            title_words = [w for w in course_title_lower.split() if w not in ['to', 'the', 'and', 'with', 'for', 'from', 'a', 'an']]
            if len(title_words) >= 2:
                # Check if at least 2 key words match
                matches = sum(1 for word in title_words[:3] if word in message_lower)
                if matches >= 2:
                    courses_to_enroll.append(course)
                    continue
            
            # Check for single main keyword + difficulty (e.g., "docker beginner", "ai advanced")
            if len(title_words) >= 1:
                main_keyword = title_words[0]
                if main_keyword in message_lower and course_difficulty in message_lower:
                    courses_to_enroll.append(course)
        
        # If no specific courses found but enrollment intent detected
        # Check for contextual references
        if not courses_to_enroll:
            context_lower = context.lower()
            
            # Check for "all", "both", or number keywords which imply multiple courses from context
            if any(word in message_lower for word in ["both", "all", "all 3", "all 4", "these"]):
                for course in courses:
                    course_title_lower = course["title"].lower()
                    # Check if course was mentioned in recent conversation
                    if course_title_lower in context_lower:
                        courses_to_enroll.append(course)
            
            # Check for "this", "that", or affirmative responses (yes, ok, sure)
            # These indicate user wants to enroll in the most recently mentioned course
            elif any(word in message_lower for word in ["this", "that"]) or is_affirmative:
                # Find the most recently mentioned course in context
                for course in courses:
                    course_title_lower = course["title"].lower()
                    if course_title_lower in context_lower:
                        # Only add the first (most recent) match
                        courses_to_enroll.append(course)
                        break
        
        # Process enrollments for found courses
        for course in courses_to_enroll:
            result = await enroll_student_tool(student_id, course["id"])
            enrollment_results.append(result)
        
        return enrollment_results
    
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
    
    async def _generate_suggestions(self, message: str, enrollment_results: list = None) -> list:
        """Generate follow-up suggestions based on message"""
        
        message_lower = message.lower()
        
        # If just enrolled, suggest next steps
        if enrollment_results and any(r.get("success") for r in enrollment_results):
            return [
                "Show my enrollments",
                "What other courses do you recommend?",
                "Tell me about the course content"
            ]
        
        if any(word in message_lower for word in ["ai", "machine learning", "ml"]):
            return [
                "Show me beginner AI courses",
                "Enroll me in Introduction to Artificial Intelligence",
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
                "Enroll me in Docker Mastery: From Beginner to Pro",
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
