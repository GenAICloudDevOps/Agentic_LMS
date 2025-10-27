"""
API endpoints for agent visualization and streaming
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from ai.agent import LMSAgent
import json

router = APIRouter()

# Initialize agent
agent = LMSAgent()


class ChatRequest(BaseModel):
    message: str
    model: str = "gemini-2.5-flash-lite"
    student_id: Optional[int] = None


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Stream agent processing updates"""
    
    async def generate():
        try:
            async for update in agent.process_message_stream(
                message=request.message,
                model=request.model,
                student_id=request.student_id
            ):
                # Send as Server-Sent Events format
                yield f"data: {json.dumps(update)}\n\n"
        except Exception as e:
            error_data = {
                "type": "error",
                "status": "error",
                "message": str(e)
            }
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("/graph")
async def get_graph_visualization(model: str = "gemini-2.5-flash-lite"):
    """Get graph structure for visualization"""
    
    try:
        graph_data = agent.get_graph_visualization(model)
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/graph/mermaid")
async def get_mermaid_diagram(model: str = "gemini-2.5-flash-lite"):
    """Get Mermaid diagram of the workflow"""
    
    try:
        graph_data = agent.get_graph_visualization(model)
        return {
            "mermaid": graph_data.get("mermaid", ""),
            "url": "https://mermaid.live/"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class ApprovalRequest(BaseModel):
    session_id: str
    approved: bool
    reason: Optional[str] = None


@router.post("/approve")
async def approve_action(request: ApprovalRequest):
    """Approve or reject a pending action (Human-in-the-Loop)"""
    
    try:
        # In a real implementation, this would:
        # 1. Look up the pending action by session_id
        # 2. Update the approval status
        # 3. Resume the graph execution
        
        # For now, return acknowledgment
        return {
            "success": True,
            "session_id": request.session_id,
            "approved": request.approved,
            "message": f"Action {'approved' if request.approved else 'rejected'}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pending-approvals")
async def get_pending_approvals():
    """Get list of actions pending approval"""
    
    # In a real implementation, this would query pending approvals
    # For now, return empty list
    return {
        "pending_approvals": []
    }
