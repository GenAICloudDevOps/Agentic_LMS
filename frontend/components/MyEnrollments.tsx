'use client'

import { useState, useEffect } from 'react'
import { studentsApi } from '@/lib/api'
import { BookOpen, CheckCircle, Clock } from 'lucide-react'

export default function MyEnrollments({ studentId }: { studentId: number }) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      const response = await studentsApi.getEnrollments(studentId)
      setEnrollments(response.data.enrollments)
    } catch (error) {
      console.error('Error loading enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-white text-center">Loading enrollments...</div>
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-bold text-white mb-2">No Enrollments Yet</h3>
        <p className="text-gray-300">Start learning by enrolling in courses!</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">My Enrollments</h2>
      
      <div className="space-y-4">
        {enrollments.map((enrollment) => (
          <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
        ))}
      </div>
    </div>
  )
}

function EnrollmentCard({ enrollment }: any) {
  const { course, progress, completed, enrolled_at } = enrollment

  return (
    <div className="bg-white/10 rounded-xl p-6 border border-white/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{course.title}</h3>
          <p className="text-gray-400 text-sm">
            Enrolled: {new Date(enrolled_at).toLocaleDateString()}
          </p>
        </div>
        {completed ? (
          <CheckCircle className="w-6 h-6 text-green-400" />
        ) : (
          <Clock className="w-6 h-6 text-yellow-400" />
        )}
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="flex gap-2 text-sm">
        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">
          {course.category}
        </span>
        <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full">
          {course.difficulty}
        </span>
      </div>
    </div>
  )
}
