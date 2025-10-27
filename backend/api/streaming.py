"""
Phase 4B: Advanced Streaming Features
Enhanced streaming with multiple modes and custom writers
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Literal
from ai.agent import LMSAgent
import json

router = APIRouter()
agent = LMSAgent()


class StreamRequest(BaseModel):
    message: str
    model: str = "gemini-2.5-flash-lite"
    student_id: Optional[int] = None
    stream_mode: Literal["values", "updates", "messages", "debug"] = "updates"


@router.post("/stream-advanced")
async def advanced_stream(request: StreamRequest):
    """
    Phase 4B: Advanced streaming with multiple modes
    
    Stream modes:
    - values: Stream full state after each node
    - updates: Stream only state updates (default)
    - messages: Stream only message updates
    - debug: Stream detailed debug information
    """
    
    async def generate():
        try:
            # Initial status
            yield f"data: {json.dumps({'type': 'start', 'mode': request.stream_mode})}\n\n"
            
            # Get message history
            messages = await agent._get_message_history(request.student_id)
            from langchain_core.messages import HumanMessage
            messages.append(HumanMessage(content=request.message))
            
            # Build graph
            graph = agent._build_graph(request.model)
            
            # Initial state
            initial_state = {
                "message": request.message,
                "student_id": request.student_id,
                "messages": messages,
                "route": None,
                "route_reasoning": None,
                "route_confidence": None,
                "requires_approval": False,
                "courses": [],
                "filtered_courses": [],
                "query": None,
                "enrollment_results": [],
                "response": "",
                "draft_response": None,
                "quality_score": None,
                "refinement_count": 0,
                "suggestions": [],
                "model_used": request.model,
                "enrolled": False,
                "subtasks": [],
                "subtask_results": [],
                "pending_approval": False,
                "approval_message": None,
                "approved": None,
                "interrupt_data": None
            }
            
            # Config
            config = {
                "configurable": {
                    "thread_id": f"student_{request.student_id}" if request.student_id else "anonymous"
                }
            }
            
            # Stream based on mode
            if request.stream_mode == "values":
                # Stream full state after each node
                async for state in graph.astream(initial_state, config=config, stream_mode="values"):
                    yield f"data: {json.dumps({'type': 'state', 'state': self._serialize_state(state)})}\n\n"
            
            elif request.stream_mode == "messages":
                # Stream only message updates
                async for event in graph.astream(initial_state, config=config, stream_mode="updates"):
                    for node_name, state_update in event.items():
                        if "messages" in state_update or "response" in state_update:
                            yield f"data: {json.dumps({'type': 'message', 'node': node_name, 'data': state_update})}\n\n"
            
            elif request.stream_mode == "debug":
                # Stream detailed debug info
                async for event in graph.astream(initial_state, config=config, stream_mode="debug"):
                    yield f"data: {json.dumps({'type': 'debug', 'event': str(event)})}\n\n"
            
            else:  # updates (default)
                async for event in graph.astream(initial_state, config=config, stream_mode="updates"):
                    for node_name, state_update in event.items():
                        yield f"data: {json.dumps({'type': 'update', 'node': node_name, 'data': state_update})}\n\n"
            
            # Get final state
            final_state = await graph.ainvoke(initial_state, config=config)
            
            # Send completion
            yield f"data: {json.dumps({'type': 'complete', 'result': {'response': final_state['response'], 'enrolled': final_state['enrolled']}})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/stream-with-tags")
async def stream_with_tags(request: StreamRequest):
    """
    Phase 4B: Stream with tag filtering
    
    Allows filtering stream events by tags for better control
    """
    
    async def generate():
        try:
            yield f"data: {json.dumps({'type': 'start', 'message': 'Streaming with tag support'})}\n\n"
            
            # Get message history
            messages = await agent._get_message_history(request.student_id)
            from langchain_core.messages import HumanMessage
            messages.append(HumanMessage(content=request.message))
            
            # Build graph
            graph = agent._build_graph(request.model)
            
            # Initial state
            initial_state = {
                "message": request.message,
                "student_id": request.student_id,
                "messages": messages,
                "route": None,
                "courses": [],
                "response": "",
                "model_used": request.model,
                "enrolled": False,
                "suggestions": []
            }
            
            # Config with tags
            config = {
                "configurable": {
                    "thread_id": f"student_{request.student_id}" if request.student_id else "anonymous"
                },
                "tags": ["chat", "lms", f"model:{request.model}"]
            }
            
            # Stream with tags
            async for event in graph.astream(initial_state, config=config, stream_mode="updates"):
                for node_name, state_update in event.items():
                    # Add node-specific tags
                    event_data = {
                        "type": "update",
                        "node": node_name,
                        "tags": [node_name, "update"],
                        "data": state_update
                    }
                    yield f"data: {json.dumps(event_data)}\n\n"
            
            # Final result
            final_state = await graph.ainvoke(initial_state, config=config)
            yield f"data: {json.dumps({'type': 'complete', 'tags': ['complete'], 'result': {'response': final_state['response']}})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'tags': ['error'], 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )


def _serialize_state(state):
    """Helper to serialize state for JSON"""
    serialized = {}
    for key, value in state.items():
        if key == "messages":
            # Serialize messages
            serialized[key] = [
                {"type": m.__class__.__name__, "content": m.content}
                for m in value
            ] if value else []
        else:
            serialized[key] = value
    return serialized
