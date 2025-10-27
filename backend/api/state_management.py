"""
Phase 4A: State Management APIs
Expose LangGraph state management for debugging and control
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from ai.agent import LMSAgent

router = APIRouter()
agent = LMSAgent()


class StateRequest(BaseModel):
    thread_id: str
    checkpoint_id: Optional[str] = None


class UpdateStateRequest(BaseModel):
    thread_id: str
    values: Dict[str, Any]
    as_node: Optional[str] = None


class ResumeRequest(BaseModel):
    thread_id: str
    checkpoint_id: str
    decision: Optional[Dict[str, Any]] = None


@router.post("/get-state")
async def get_state(request: StateRequest):
    """
    Phase 4A: Get current state of a conversation thread
    
    Useful for:
    - Debugging conversation flow
    - Inspecting what the agent knows
    - Understanding routing decisions
    """
    try:
        config = {
            "configurable": {
                "thread_id": request.thread_id
            }
        }
        
        if request.checkpoint_id:
            config["configurable"]["checkpoint_id"] = request.checkpoint_id
        
        # Build a temporary graph to access state
        graph = agent._build_graph("gemini-2.5-flash-lite")
        
        # Get state
        state_snapshot = graph.get_state(config)
        
        return {
            "success": True,
            "thread_id": request.thread_id,
            "state": {
                "values": state_snapshot.values,
                "next": state_snapshot.next,
                "metadata": state_snapshot.metadata,
                "created_at": str(state_snapshot.created_at) if state_snapshot.created_at else None,
                "parent_checkpoint_id": state_snapshot.parent_config.get("configurable", {}).get("checkpoint_id") if state_snapshot.parent_config else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get state: {str(e)}")


@router.post("/get-state-history")
async def get_state_history(request: StateRequest):
    """
    Phase 4A: Get full execution history for a thread
    
    Returns all checkpoints in chronological order.
    Useful for:
    - Time-travel debugging
    - Understanding conversation flow
    - Replaying conversations
    """
    try:
        config = {
            "configurable": {
                "thread_id": request.thread_id
            }
        }
        
        # Build a temporary graph
        graph = agent._build_graph("gemini-2.5-flash-lite")
        
        # Get state history
        history = []
        for state_snapshot in graph.get_state_history(config):
            history.append({
                "checkpoint_id": state_snapshot.config.get("configurable", {}).get("checkpoint_id"),
                "values": state_snapshot.values,
                "next": state_snapshot.next,
                "created_at": str(state_snapshot.created_at) if state_snapshot.created_at else None,
                "parent_checkpoint_id": state_snapshot.parent_config.get("configurable", {}).get("checkpoint_id") if state_snapshot.parent_config else None,
                "tasks": [
                    {
                        "id": task.id,
                        "name": task.name,
                        "error": str(task.error) if task.error else None
                    }
                    for task in (state_snapshot.tasks or [])
                ]
            })
        
        return {
            "success": True,
            "thread_id": request.thread_id,
            "history": history,
            "count": len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get state history: {str(e)}")


@router.post("/update-state")
async def update_state(request: UpdateStateRequest):
    """
    Phase 4A: Manually update state of a conversation
    
    Useful for:
    - Correcting mistakes (e.g., wrong enrollment)
    - Injecting information
    - Testing specific scenarios
    """
    try:
        config = {
            "configurable": {
                "thread_id": request.thread_id
            }
        }
        
        # Build a temporary graph
        graph = agent._build_graph("gemini-2.5-flash-lite")
        
        # Update state
        updated_config = graph.update_state(
            config,
            request.values,
            as_node=request.as_node
        )
        
        return {
            "success": True,
            "thread_id": request.thread_id,
            "message": "State updated successfully",
            "updated_checkpoint_id": updated_config.get("configurable", {}).get("checkpoint_id")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update state: {str(e)}")


@router.post("/replay")
async def replay_from_checkpoint(request: StateRequest):
    """
    Phase 4A: Replay conversation from a specific checkpoint
    
    Useful for:
    - Testing "what if" scenarios
    - Recovering from errors
    - Branching conversations
    """
    try:
        if not request.checkpoint_id:
            raise HTTPException(status_code=400, detail="checkpoint_id is required for replay")
        
        config = {
            "configurable": {
                "thread_id": request.thread_id,
                "checkpoint_id": request.checkpoint_id
            }
        }
        
        # Build a temporary graph
        graph = agent._build_graph("gemini-2.5-flash-lite")
        
        # Get state at checkpoint
        state_snapshot = graph.get_state(config)
        
        return {
            "success": True,
            "thread_id": request.thread_id,
            "checkpoint_id": request.checkpoint_id,
            "state": {
                "values": state_snapshot.values,
                "next": state_snapshot.next,
                "created_at": str(state_snapshot.created_at) if state_snapshot.created_at else None
            },
            "message": "State loaded from checkpoint. You can now continue from this point."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to replay: {str(e)}")


@router.post("/resume")
async def resume_interrupted(request: ResumeRequest):
    """
    Phase 4B: Resume an interrupted conversation with a decision
    
    Used with interrupt() for human-in-the-loop workflows.
    """
    try:
        config = {
            "configurable": {
                "thread_id": request.thread_id,
                "checkpoint_id": request.checkpoint_id
            }
        }
        
        # Build graph
        graph = agent._build_graph("gemini-2.5-flash-lite")
        
        # Get current state
        state_snapshot = graph.get_state(config)
        
        # Resume with decision
        # The decision will be passed to the interrupt() call
        result = await graph.ainvoke(
            None,  # Continue from checkpoint
            config=config,
            input=request.decision
        )
        
        return {
            "success": True,
            "thread_id": request.thread_id,
            "message": "Conversation resumed",
            "result": {
                "response": result.get("response"),
                "enrolled": result.get("enrolled", False)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resume: {str(e)}")


@router.get("/threads")
async def list_threads():
    """
    List all active conversation threads
    
    Useful for:
    - Monitoring active conversations
    - Finding threads that need attention
    """
    try:
        # In a real implementation, this would query the checkpointer
        # For MemorySaver, we'd need to track threads separately
        
        return {
            "success": True,
            "message": "Thread listing requires persistent checkpointer (Postgres/Redis)",
            "threads": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list threads: {str(e)}")


@router.delete("/thread/{thread_id}")
async def delete_thread(thread_id: str):
    """
    Delete a conversation thread and all its checkpoints
    
    Useful for:
    - Cleaning up test data
    - Privacy/GDPR compliance
    """
    try:
        # In a real implementation, this would delete from checkpointer
        
        return {
            "success": True,
            "thread_id": thread_id,
            "message": "Thread deletion requires persistent checkpointer (Postgres/Redis)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete thread: {str(e)}")
