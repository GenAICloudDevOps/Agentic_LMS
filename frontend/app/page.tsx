"use client";

import { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved student ID in localStorage
    const savedStudentId = localStorage.getItem("studentId");
    if (savedStudentId) {
      const id = parseInt(savedStudentId, 10);
      setStudentId(id);
      setShowDashboard(true);
    }
    setLoading(false);
  }, []);

  const handleGetStarted = (id: number) => {
    setStudentId(id);
    setShowDashboard(true);
    // Save to localStorage
    localStorage.setItem("studentId", id.toString());
  };

  const handleLogout = () => {
    setShowDashboard(false);
    setStudentId(null);
    // Clear localStorage
    localStorage.removeItem("studentId");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (showDashboard && studentId) {
    return <Dashboard studentId={studentId} onBack={handleLogout} />;
  }

  return <LandingPage onGetStarted={handleGetStarted} />;
}
