import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const coursesApi = {
  getAll: (params?: any) => api.get('/api/courses', { params }),
  getById: (id: number) => api.get(`/api/courses/${id}`),
  getCategories: () => api.get('/api/courses/categories/list'),
}

export const studentsApi = {
  create: (data: { name: string; email: string }) => api.post('/api/students', data),
  getById: (id: number) => api.get(`/api/students/${id}`),
  getEnrollments: (id: number) => api.get(`/api/students/${id}/enrollments`),
}

export const enrollmentsApi = {
  create: (data: { student_id: number; course_id: number }) => 
    api.post('/api/enrollments', data),
}

export const chatApi = {
  sendMessage: (data: { message: string; student_id?: number; model?: string }) =>
    api.post('/api/chat', data),
  getModels: () => api.get('/api/chat/models'),
  getHistory: (studentId: number) => api.get(`/api/chat/history/${studentId}`),
}

export default api
