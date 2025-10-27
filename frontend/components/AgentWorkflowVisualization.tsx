"use client";

import { useEffect, useState } from "react";

interface Node {
  id: string;
  label: string;
}

interface Edge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
  mermaid: string;
}

export default function AgentWorkflowVisualization() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/agent/graph`);
      const data = await response.json();
      setGraphData(data);
    } catch (err) {
      setError("Failed to load workflow visualization");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !graphData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🔀 Agent Workflow</h2>
        <p className="text-blue-100">
          Visual representation of the LangGraph agent workflow
        </p>
      </div>

      {/* Nodes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-2">
            📦
          </span>
          Workflow Nodes ({graphData.nodes.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {graphData.nodes.map((node) => (
            <div
              key={node.id}
              className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="font-medium text-sm text-gray-800">
                {node.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">{node.id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edges */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center mr-2">
            🔗
          </span>
          Connections ({graphData.edges.length})
        </h3>
        <div className="space-y-2">
          {graphData.edges.map((edge, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
            >
              <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium">
                {edge.source}
              </span>
              <span className="mx-3 text-gray-400">→</span>
              <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-medium">
                {edge.target}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mermaid Diagram */}
      {graphData.mermaid && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-2">
              📊
            </span>
            Mermaid Diagram
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {graphData.mermaid}
            </pre>
          </div>
          <div className="mt-4">
            <a
              href="https://mermaid.live/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span className="mr-2">🔗</span>
              Visualize on Mermaid Live
            </a>
          </div>
        </div>
      )}

      {/* Workflow Description */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          📖 How It Works
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>1. START</strong> → User message enters the workflow
          </p>
          <p>
            <strong>2. load_courses</strong> → Fetches all available courses
          </p>
          <p>
            <strong>3. router</strong> → Detects user intent (discovery,
            enrollment, recommendation, Q&A)
          </p>
          <p>
            <strong>4. Intent Handler</strong> → Routes to specialized node
            based on intent
          </p>
          <p>
            <strong>5. generate_suggestions</strong> → Creates follow-up
            suggestions
          </p>
          <p>
            <strong>6. END</strong> → Returns response to user
          </p>
        </div>
      </div>
    </div>
  );
}
