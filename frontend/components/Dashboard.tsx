'use client'

import { useState, useRef } from 'react'
import ChatInterface from './ChatInterface'
import CourseCatalog from './CourseCatalog'
import MyEnrollments from './MyEnrollments'
import { ArrowLeft, MessageSquare, BookOpen, GraduationCap } from 'lucide-react'

interface DashboardProps {
  studentId: number
  onBack: () => void
}

export default function Dashboard({ studentId, onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'courses' | 'enrollments'>('chat')
  const [enrollmentKey, setEnrollmentKey] = useState(0)

  const handleEnrollmentChange = () => {
    // Force refresh of enrollments component
    setEnrollmentKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-white hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-white">Learning Dashboard</h1>
          <div className="w-24"></div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <TabButton
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            icon={<MessageSquare className="w-5 h-5" />}
            label="AI Assistant"
          />
          <TabButton
            active={activeTab === 'courses'}
            onClick={() => setActiveTab('courses')}
            icon={<BookOpen className="w-5 h-5" />}
            label="Course Catalog"
          />
          <TabButton
            active={activeTab === 'enrollments'}
            onClick={() => setActiveTab('enrollments')}
            icon={<GraduationCap className="w-5 h-5" />}
            label="My Enrollments"
          />
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          {activeTab === 'chat' && (
            <ChatInterface 
              studentId={studentId} 
              onEnrollmentChange={handleEnrollmentChange}
            />
          )}
          {activeTab === 'courses' && (
            <CourseCatalog 
              studentId={studentId}
              onEnrollmentChange={handleEnrollmentChange}
            />
          )}
          {activeTab === 'enrollments' && (
            <MyEnrollments 
              key={enrollmentKey}
              studentId={studentId} 
            />
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
        active
          ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
          : 'bg-white/10 text-gray-300 hover:bg-white/20'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
