'use client'

import { useState } from 'react'
import LandingPage from '@/components/LandingPage'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [studentId, setStudentId] = useState<number | null>(null)

  const handleGetStarted = (id: number) => {
    setStudentId(id)
    setShowDashboard(true)
  }

  if (showDashboard && studentId) {
    return <Dashboard studentId={studentId} onBack={() => setShowDashboard(false)} />
  }

  return <LandingPage onGetStarted={handleGetStarted} />
}
