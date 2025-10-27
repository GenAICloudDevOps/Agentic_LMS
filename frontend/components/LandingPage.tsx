"use client";

import { useState } from "react";
import {
  BookOpen,
  Brain,
  Code,
  Server,
  MessageSquare,
  X,
  Sun,
  Moon,
  TrendingUp,
  Zap,
  Users,
  Bell,
} from "lucide-react";
import { studentsApi } from "@/lib/api";

interface LandingPageProps {
  onGetStarted: (studentId: number) => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const response = await studentsApi.create({ name, email });
        onGetStarted(response.data.id);
      } else {
        // Sign In
        const response = await studentsApi.login(email);
        onGetStarted(response.data.id);
      }
    } catch (error: any) {
      console.error("Error:", error);
      const message =
        error.response?.data?.detail ||
        (isSignUp ? "Error creating account." : "Error signing in.");
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setName("");
    setEmail("");
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Header with Get Started Button */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-start">
          {/* Logo */}
          <div
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            LMS<span className="text-purple-500">.</span>
          </div>

          <div className="flex flex-col items-end gap-4">
            {/* Buttons Row */}
            <div className="flex items-center gap-4">
              {/* Dark/Light Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode
                    ? "bg-slate-800 text-yellow-400 hover:bg-slate-700 border border-slate-700"
                    : "bg-white text-slate-700 hover:bg-gray-100 border border-gray-300"
                }`}
                title={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setShowModal(true);
                }}
                className={`font-semibold py-3 px-8 rounded-lg transition-all ${
                  isDarkMode
                    ? "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                    : "bg-white text-slate-900 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setShowModal(true);
                }}
                className={`font-bold py-3 px-8 rounded-lg transition-all ${
                  isDarkMode
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 relative">
        {/* Terminal Status Display - Positioned in top right */}
        <div
          className={`absolute rounded-xl p-6 font-mono text-base flex flex-col justify-center ${
            isDarkMode
              ? "bg-slate-800/50 border border-slate-700"
              : "bg-white border border-gray-200"
          }`}
          style={{ right: "-3rem", top: "1rem", zIndex: 10 }}
        >
          <div className="space-y-2">
            {/* Command line */}
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-base">$</span>
              <span className="text-green-400 whitespace-nowrap text-base">
                lms-ai --start
              </span>
            </div>

            {/* Status items with checkmarks */}
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span
                className={`${
                  isDarkMode ? "text-green-400" : "text-green-600"
                } whitespace-nowrap text-base`}
              >
                LangGraph v1.0 initialized
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span
                className={`${
                  isDarkMode ? "text-green-400" : "text-green-600"
                } whitespace-nowrap text-base`}
              >
                Gmail notifications active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span
                className={`${
                  isDarkMode ? "text-green-400" : "text-green-600"
                } whitespace-nowrap text-base`}
              >
                Slack integration ready
              </span>
            </div>

            {/* Welcome message */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-yellow-400 whitespace-nowrap text-base">
                Welcome to LMS and AI! ☕🤖
              </span>
            </div>
          </div>
        </div>

        {/* Center: Title */}
        <div className="flex justify-center items-start mb-16">
          <div className="text-center">
            <h1
              className={`text-5xl md:text-6xl font-bold mb-6 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Learning Management System
            </h1>
            <p
              className={`text-2xl mb-4 ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              AI Powered
            </p>
            <p
              className={`text-xl ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Use natural language to discover and enroll in courses
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="AI & ML"
            description="Deep learning, neural networks, and cutting-edge AI"
            isDarkMode={isDarkMode}
            color="blue"
          />
          <FeatureCard
            icon={<Server className="w-8 h-8" />}
            title="DevOps"
            description="CI/CD, automation, and infrastructure as code"
            isDarkMode={isDarkMode}
            color="orange"
          />
          <FeatureCard
            icon={<Code className="w-8 h-8" />}
            title="Docker"
            description="Containerization and microservices architecture"
            isDarkMode={isDarkMode}
            color="cyan"
          />
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Kubernetes"
            description="Container orchestration at scale"
            isDarkMode={isDarkMode}
            color="purple"
          />
        </div>

        {/* Course Preview Section */}
        <div className="mb-16">
          <h2
            className={`text-3xl font-bold text-center mb-8 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Featured Courses
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <CoursePreviewCard
              title="Introduction to Artificial Intelligence"
              level="Beginner"
              duration="40h"
              category="AI"
              isDarkMode={isDarkMode}
            />
            <CoursePreviewCard
              title="Docker Mastery"
              level="Intermediate"
              duration="30h"
              category="Docker"
              isDarkMode={isDarkMode}
            />
            <CoursePreviewCard
              title="Kubernetes at Scale"
              level="Advanced"
              duration="50h"
              category="Kubernetes"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* AI Chat Feature */}
        <div
          className={`rounded-2xl p-8 mb-16 text-center border ${
            isDarkMode
              ? "bg-slate-800/50 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <MessageSquare
            className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? "text-purple-400" : "text-purple-600"
            }`}
          />
          <h2
            className={`text-3xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            AI-Powered Learning Assistant
          </h2>
          <p
            className={`text-xl ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Chat with our AI to discover courses, get recommendations, and
            enroll instantly
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2
            className={`text-3xl font-bold text-center mb-12 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <HowItWorksCard
              step="1"
              icon="🗣️"
              title="Chat"
              description="Ask our AI about courses in natural language"
              isDarkMode={isDarkMode}
              color="purple"
            />
            <HowItWorksCard
              step="2"
              icon="🎯"
              title="Discover"
              description="Get personalized recommendations based on your goals"
              isDarkMode={isDarkMode}
              color="blue"
            />
            <HowItWorksCard
              step="3"
              icon="✅"
              title="Enroll"
              description="Start learning instantly with one-click enrollment"
              isDarkMode={isDarkMode}
              color="green"
            />
          </div>
        </div>

        {/* Footer - Tech Stack */}
        <div
          className={`text-center py-8 border-t ${
            isDarkMode ? "border-slate-800" : "border-gray-200"
          }`}
        >
          <p
            className={`mb-3 text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Built with modern technology
          </p>
          <div
            className={`flex flex-wrap items-center justify-center gap-6 text-sm ${
              isDarkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            <span className="flex items-center gap-1">⚡ LangGraph v1.0</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">🤖 Multi-Model AI</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              📧 Gmail Integration
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              💬 Slack Notifications
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              🔄 Real-Time Streaming
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">💾 State Management</span>
          </div>
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
              {isSignUp ? "Get Started" : "Sign In"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
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
              )}
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
                {loading
                  ? isSignUp
                    ? "Creating Account..."
                    : "Signing In..."
                  : isSignUp
                  ? "Start Learning"
                  : "Sign In"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isSignUp
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description, isDarkMode, color }: any) {
  const colorClasses: any = {
    blue: isDarkMode
      ? "bg-blue-500/20 text-blue-400"
      : "bg-blue-100 text-blue-600",
    orange: isDarkMode
      ? "bg-orange-500/20 text-orange-400"
      : "bg-orange-100 text-orange-600",
    purple: isDarkMode
      ? "bg-purple-500/20 text-purple-400"
      : "bg-purple-100 text-purple-600",
    green: isDarkMode
      ? "bg-green-500/20 text-green-400"
      : "bg-green-100 text-green-600",
    cyan: isDarkMode
      ? "bg-cyan-500/20 text-cyan-400"
      : "bg-cyan-100 text-cyan-600",
    pink: isDarkMode
      ? "bg-pink-500/20 text-pink-400"
      : "bg-pink-100 text-pink-600",
  };

  return (
    <div
      className={`rounded-xl p-6 border transition-all ${
        isDarkMode
          ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg"
      }`}
    >
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
          colorClasses[color || "blue"]
        }`}
      >
        {icon}
      </div>
      <h3
        className={`text-xl font-bold mb-2 ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h3>
      <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
        {description}
      </p>
    </div>
  );
}

function StatCard({ icon, number, label, isDarkMode, color }: any) {
  const colorClasses: any = {
    blue: isDarkMode
      ? "bg-blue-500/20 text-blue-400"
      : "bg-blue-100 text-blue-600",
    green: isDarkMode
      ? "bg-green-500/20 text-green-400"
      : "bg-green-100 text-green-600",
    purple: isDarkMode
      ? "bg-purple-500/20 text-purple-400"
      : "bg-purple-100 text-purple-600",
    orange: isDarkMode
      ? "bg-orange-500/20 text-orange-400"
      : "bg-orange-100 text-orange-600",
  };

  return (
    <div
      className={`rounded-xl p-6 border ${
        isDarkMode
          ? "bg-slate-800/50 border-slate-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
          colorClasses[color || "blue"]
        }`}
      >
        {icon}
      </div>
      <div
        className={`text-3xl font-bold mb-1 ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        {number}
      </div>
      <div
        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        {label}
      </div>
    </div>
  );
}

function CoursePreviewCard({
  title,
  level,
  duration,
  category,
  isDarkMode,
}: any) {
  const levelColors: any = {
    Beginner: isDarkMode
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : "bg-green-100 text-green-700",
    Intermediate: isDarkMode
      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
      : "bg-purple-100 text-purple-700",
    Advanced: isDarkMode
      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
      : "bg-orange-100 text-orange-700",
  };

  return (
    <div
      className={`rounded-xl p-6 border transition-all ${
        isDarkMode
          ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs px-3 py-1 rounded-full ${levelColors[level]}`}
        >
          {level}
        </span>
        <span
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {duration}
        </span>
      </div>
      <h3
        className={`text-lg font-bold mb-2 ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h3>
      <div
        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        Category: {category}
      </div>
    </div>
  );
}

function HowItWorksCard({
  step,
  icon,
  title,
  description,
  isDarkMode,
  color,
}: any) {
  const colorClasses: any = {
    purple: isDarkMode
      ? "bg-purple-500/20 text-purple-400"
      : "bg-purple-100 text-purple-600",
    blue: isDarkMode
      ? "bg-blue-500/20 text-blue-400"
      : "bg-blue-100 text-blue-600",
    green: isDarkMode
      ? "bg-green-500/20 text-green-400"
      : "bg-green-100 text-green-600",
  };

  return (
    <div className="text-center">
      <div
        className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center text-2xl ${
          colorClasses[color || "purple"]
        }`}
      >
        {icon}
      </div>
      <div
        className={`text-sm font-semibold mb-2 ${
          isDarkMode ? "text-purple-400" : "text-purple-600"
        }`}
      >
        Step {step}
      </div>
      <h3
        className={`text-xl font-bold mb-2 ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h3>
      <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
        {description}
      </p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, isDarkMode }: any) {
  return (
    <div
      className={`rounded-xl p-6 border ${
        isDarkMode
          ? "bg-slate-800/50 border-slate-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`text-4xl mb-4 ${
          isDarkMode ? "text-purple-500/30" : "text-gray-300"
        }`}
      >
        "
      </div>
      <p
        className={`mb-4 italic ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {quote}
      </p>
      <div
        className={`font-semibold ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        {author}
      </div>
      <div
        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        {role}
      </div>
    </div>
  );
}
