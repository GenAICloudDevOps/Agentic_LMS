"use client";

import { useState } from "react";
import AgentWorkflowVisualization from "@/components/AgentWorkflowVisualization";
import StreamingChat from "@/components/StreamingChat";

export default function AgentDemoPage() {
  const [activeTab, setActiveTab] = useState<"workflow" | "streaming">(
    "workflow"
  );
  const [studentId] = useState<number | null>(1); // Mock student ID

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🤖 LangGraph Agent Demo
          </h1>
          <p className="text-blue-200">
            Phase 2: Streaming, Parallelization & Visualization
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("workflow")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "workflow"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="mr-2">📊</span>
              Workflow Visualization
            </button>
            <button
              onClick={() => setActiveTab("streaming")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "streaming"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="mr-2">🔄</span>
              Streaming Chat
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === "workflow" && <AgentWorkflowVisualization />}
          {activeTab === "streaming" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  Real-Time Streaming Chat
                </h2>
                <p className="text-gray-600">
                  Watch the agent process your message in real-time with live
                  updates from each workflow node.
                </p>
              </div>
              <StreamingChat studentId={studentId} />
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Parallelization</h3>
            <p className="text-sm text-gray-600">
              Multiple operations run simultaneously for faster responses
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="text-lg font-semibold mb-2">Streaming</h3>
            <p className="text-sm text-gray-600">
              Real-time updates as the agent processes your request
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Visualization</h3>
            <p className="text-sm text-gray-600">
              Visual representation of the workflow graph structure
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
          >
            <span className="mr-2">←</span>
            Back to Main App
          </a>
        </div>
      </div>
    </div>
  );
}
