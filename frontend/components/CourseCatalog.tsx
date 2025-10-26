'use client'

import { useState, useEffect } from 'react'
import { coursesApi, enrollmentsApi } from '@/lib/api'
import { BookOpen, Clock, Award } from 'lucide-react'

interface CourseCatalogProps {
  studentId: number
  onEnrollmentChange?: () => void
}

export default function CourseCatalog({ studentId, onEnrollmentChange }: CourseCatalogProps) {
  const [courses, setCourses] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([])

  useEffect(() => {
    loadCourses()
    loadCategories()
    loadEnrolledCourses()
  }, [selectedCategory])

  const loadCourses = async () => {
    try {
      const params = selectedCategory !== 'All' ? { category: selectedCategory } : {}
      const response = await coursesApi.getAll(params)
      setCourses(response.data)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await coursesApi.getCategories()
      setCategories(['All', ...response.data.categories])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadEnrolledCourses = async () => {
    try {
      const response = await enrollmentsApi.getEnrolledCourses(studentId)
      setEnrolledCourseIds(response.data.enrolled_course_ids)
    } catch (error) {
      console.error('Error loading enrolled courses:', error)
    }
  }

  const handleEnroll = async (courseId: number) => {
    try {
      await enrollmentsApi.create({ student_id: studentId, course_id: courseId })
      alert('Successfully enrolled!')
      loadEnrolledCourses() // Refresh enrolled courses
      if (onEnrollmentChange) {
        onEnrollmentChange()
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Enrollment failed')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Course Catalog</h2>
      
      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-white text-center">Loading courses...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={enrolledCourseIds.includes(course.id)}
              onEnroll={() => handleEnroll(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseCard({ course, isEnrolled, onEnroll }: any) {
  const difficultyColor = {
    Beginner: 'text-green-400',
    Intermediate: 'text-yellow-400',
    Advanced: 'text-red-400'
  }

  return (
    <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-white">{course.title}</h3>
        <BookOpen className="w-6 h-6 text-blue-400" />
      </div>
      
      <p className="text-gray-300 mb-4">{course.description}</p>
      
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className={`flex items-center gap-1 ${difficultyColor[course.difficulty]}`}>
          <Award className="w-4 h-4" />
          {course.difficulty}
        </span>
        <span className="flex items-center gap-1 text-gray-400">
          <Clock className="w-4 h-4" />
          {course.duration_hours}h
        </span>
      </div>
      
      <button
        onClick={isEnrolled ? undefined : onEnroll}
        disabled={isEnrolled}
        className={`w-full py-2 rounded-lg transition-all ${
          isEnrolled
            ? 'bg-green-600 text-white cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600'
        }`}
      >
        {isEnrolled ? 'Enrolled' : 'Enroll Now'}
      </button>
    </div>
  )
}
