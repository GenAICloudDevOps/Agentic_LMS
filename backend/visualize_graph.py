"""
Visualize the LangGraph workflow
Run: python visualize_graph.py
"""
import asyncio
from ai.agent import LMSAgent


async def visualize():
    agent = LMSAgent()
    
    # Build the graph
    graph = agent._build_graph("gemini-2.5-flash-lite")
    
    # Get the graph visualization
    try:
        # Try to generate PNG (requires graphviz)
        png_data = graph.get_graph().draw_mermaid_png()
        with open("agent_workflow.png", "wb") as f:
            f.write(png_data)
        print("✅ Graph visualization saved to agent_workflow.png")
    except Exception as e:
        print(f"⚠️ Could not generate PNG: {e}")
        print("Generating Mermaid diagram instead...")
        
        # Generate Mermaid diagram (text format)
        mermaid = graph.get_graph().draw_mermaid()
        with open("agent_workflow.mmd", "w") as f:
            f.write(mermaid)
        print("✅ Mermaid diagram saved to agent_workflow.mmd")
        print("\nYou can visualize it at: https://mermaid.live/")
        print("\nOr install graphviz: pip install pygraphviz")


if __name__ == "__main__":
    asyncio.run(visualize())
