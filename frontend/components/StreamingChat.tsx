"use client";

import { useState } from "react";

interface StreamUpdate {
  type: "status" | "node_update" | "complete" | "error";
  status: string;
  message?: string;
  node?: string;
  data?: any;
  result?: {
    response: string;
    suggestions: string[];
    enrolled: boolean;
  };
}

interface StreamingChatProps {
  studentId: number | null;
  model?: string;
}

export default function StreamingChat({
  studentId,
  model = "gemini-2.5-flash-lite",
}: StreamingChatProps) {
  const [message, setMessage] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [updates, setUpdates] = useState<StreamUpdate[]>([]);
  const [finalResponse, setFinalResponse] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleStreamChat = async () => {
    if (!message.trim()) return;

    setStreaming(true);
    setUpdates([]);
    setFinalResponse(null);
    setSuggestions([]);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/agent/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          model,
          student_id: studentId,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            setUpdates((prev) => [...prev, data]);

            if (data.type === "complete" && data.result) {
              setFinalResponse(data.result.response);
              setSuggestions(data.result.suggestions || []);
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setUpdates((prev) => [
        ...prev,
        {
          type: "error",
          status: "error",
          message: "Failed to stream response",
        },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "status":
        return "⏳";
      case "node_update":
        return "⚙️";
      case "complete":
        return "✅";
      case "error":
        return "❌";
      default:
        return "📝";
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case "status":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "node_update":
        return "bg-purple-50 border-purple-200 text-purple-700";
      case "complete":
        return "bg-green-50 border-green-200 text-green-700";
      case "error":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleStreamChat()}
            placeholder="Ask me anything about courses..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={streaming}
          />
          <button
            onClick={handleStreamChat}
            disabled={streaming || !message.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {streaming ? "Processing..." : "Send"}
          </button>
        </div>
      </div>

      {/* Streaming Updates */}
      {updates.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="mr-2">🔄</span>
            Processing Updates
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {updates.map((update, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${getStatusColor(
                  update.type
                )}`}
              >
                <div className="flex items-start">
                  <span className="mr-2 text-lg">{getStatusIcon(update.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{update.status}</div>
                    {update.message && (
                      <div className="text-xs mt-1 opacity-75">
                        {update.message}
                      </div>
                    )}
                    {update.node && (
                      <div className="text-xs mt-1 font-mono bg-white bg-opacity-50 px-2 py-1 rounded">
                        Node: {update.node}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Response */}
      {finalResponse && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
            <span className="mr-2">💬</span>
            Response
          </h3>
          <div className="text-gray-700 whitespace-pre-wrap">{finalResponse}</div>

          {suggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="text-sm font-medium text-gray-600 mb-2">
                💡 Suggestions:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(suggestion)}
                    className="px-3 py-1 bg-white border border-green-300 rounded-full text-sm text-gray-700 hover:bg-green-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
