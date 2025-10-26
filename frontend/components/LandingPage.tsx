"use client";

import { useState } from "react";
import { BookOpen, Brain, Code, Server, MessageSquare, X } from "lucide-react";
import { studentsApi } from "@/lib/api";

interface LandingPageProps {
  onGetStarted: (studentId: number) => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await studentsApi.create({ name, email });
      onGetStarted(response.data.id);
    } catch (error) {
      console.error("Error creating student:", error);
      alert("Error creating account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header with Get Started Button */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-slate-950 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Learning Management System
          </h1>
          <p className="text-2xl text-white mb-4">AI Powered</p>
          <p className="text-xl text-gray-300">
            Use natural language to discover and enroll in courses
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<Brain className="w-12 h-12" />}
            title="AI & ML"
            description="Deep learning, neural networks, and cutting-edge AI"
          />
          <FeatureCard
            icon={<Server className="w-12 h-12" />}
            title="DevOps"
            description="CI/CD, automation, and infrastructure as code"
          />
          <FeatureCard
            icon={<Code className="w-12 h-12" />}
            title="Docker"
            description="Containerization and microservices architecture"
          />
          <FeatureCard
            icon={<BookOpen className="w-12 h-12" />}
            title="Kubernetes"
            description="Container orchestration at scale"
          />
        </div>

        {/* AI Chat Feature */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-16 text-center border border-slate-800">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-white" />
          <h2 className="text-3xl font-bold text-white mb-4">
            AI-Powered Learning Assistant
          </h2>
          <p className="text-xl text-gray-300">
            Chat with our AI to discover courses, get recommendations, and
            enroll instantly
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700 max-w-md w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Get Started
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-slate-950 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Start Learning"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:bg-slate-800 transition-all">
      <div className="text-white mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
