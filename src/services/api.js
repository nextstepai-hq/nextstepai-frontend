import axios from 'axios'
import { API_BASE_URL } from './apiConfig'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        })

        localStorage.setItem('accessToken', data.access_token)
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`

        return api(originalRequest)
      } catch (refreshError) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ============ AUTH APIs ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: () => window.location.href = `${API_BASE_URL}/auth/google`,
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: ({ email, token, password }) => api.post('/auth/reset-password', { email, token, password, password_confirmation: password }),
}

// ============ SKILL GAP APIs ============
export const skillGapAPI = {
  analyze: (formData) => api.post('/skill-gap/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// ============ ROADMAP APIs ============
export const roadmapAPI = {
  getAll: () => api.get('/roadmaps'),
  generate: (data) => api.post('/roadmaps/generate', data),
  getOne: (id) => api.get(`/roadmaps/${id}`),
  delete: (id) => api.delete(`/roadmaps/${id}`),
  getVideos: (id, skillName, language) => api.get(`/roadmaps/${id}/videos`, { params: { skill: skillName, language } }),
}

// ============ PROGRESS APIs ============
export const progressAPI = {
  start: (data) => api.post('/progress/start', data),
  complete: (id, data) => api.post(`/progress/${id}/complete`, data),
  trackVideo: (id, videoId) => api.post(`/progress/${id}/track-video`, { video_id: videoId }),
  getRoadmapProgress: (roadmapId) => api.get(`/progress/roadmap/${roadmapId}`),
  getWeeklyInsights: () => api.get('/progress/weekly-insights'),
}

// ============ CERTIFICATE APIs ============
export const certificateAPI = {
  getAll: () => api.get('/certificates'),
  generate: (roadmapId) => api.post(`/certificates/generate/${roadmapId}`),
  verify: (id) => api.get(`/certificates/verify/${id}`),
  download: (id, format = 'pdf') =>
    api.get(`/certificates/${id}/download`, {
      params: { format },
      responseType: 'blob',
    }),
}

// ============ PROFILE APIs ============
export const profileAPI = {
  update: (data) => api.put('/profile', data),
  uploadAvatar: (formData) => api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAvatar: () => api.delete('/profile/avatar'),
  saveLocation: (coords) => api.post('/profile/location', coords),
}

// ============ GAMIFICATION APIs ============
export const gamificationAPI = {
  getLeaderboard: (params) => api.get('/gamification/leaderboard', { params }),
  getBadges: () => api.get('/gamification/badges'),
  getStats: () => api.get('/gamification/stats'),
}

// ============ ADMIN APIs ============
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  exportUsers: (params) => api.get('/admin/users/export', { params, responseType: 'blob' }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  triggerPasswordReset: (id) => api.post(`/admin/users/${id}/password-reset`),
  getStats: () => api.get('/admin/stats'),
  getReports: (params) => api.get('/admin/reports', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getResumeAnalyses: (params) => api.get('/admin/resume-analyses', { params }),
  getQuizAttempts: (params) => api.get('/admin/quiz-attempts', { params }),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  getPracticeReviews: () => api.get('/admin/practice-reviews'),
  reviewPracticeTask: (progressId, data) => api.post(`/admin/practice-reviews/${progressId}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteCertificate: (id, reason) => api.delete(`/admin/certificates/${id}`, { data: { reason } }),
  getCertificates: (params) => api.get('/admin/certificates', { params }),
  getQuizzes: (params) => api.get('/admin/quizzes', { params }),
  createQuiz: (data) => api.post('/admin/quizzes', data),
  updateQuiz: (id, data) => api.put(`/admin/quizzes/${id}`, data),
  getCareerRoles: (params) => api.get('/admin/career-roles', { params }),
  createCareerRole: (data) => api.post('/admin/career-roles', data),
  updateCareerRole: (id, data) => api.put(`/admin/career-roles/${id}`, data),
  archiveCareerRole: (id) => api.delete(`/admin/career-roles/${id}`),
  getSkills: (params) => api.get('/admin/skills', { params }),
  createSkill: (data) => api.post('/admin/skills', data),
  updateSkill: (id, data) => api.put(`/admin/skills/${id}`, data),
  archiveSkill: (id) => api.delete(`/admin/skills/${id}`),
  getRoadmapTemplates: (params) => api.get('/admin/roadmap-templates', { params }),
  createRoadmapTemplate: (data) => api.post('/admin/roadmap-templates', data),
  updateRoadmapTemplate: (id, data) => api.put(`/admin/roadmap-templates/${id}`, data),
  archiveRoadmapTemplate: (id) => api.delete(`/admin/roadmap-templates/${id}`),
  getMedia: (params) => api.get('/admin/media', { params }),
  uploadMedia: (formData) => api.post('/admin/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  downloadMedia: (id) => api.get(`/admin/media/${id}/download`, { responseType: 'blob' }),
  deleteMedia: (id) => api.delete(`/admin/media/${id}`),
  getNotificationTemplates: () => api.get('/admin/notification-templates'),
  createNotificationTemplate: (data) => api.post('/admin/notification-templates', data),
  updateNotificationTemplate: (id, data) => api.put(`/admin/notification-templates/${id}`, data),
  publishAnnouncement: (data) => api.post('/admin/announcements', data),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', { settings }),
  getCourses: (params) => api.get('/admin/courses', { params }),
  getCourse: (id) => api.get(`/admin/courses/${id}`),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  addLesson: (courseId, data) => api.post(`/admin/courses/${courseId}/lessons`, data),
  updateLesson: (id, data) => api.put(`/admin/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/admin/lessons/${id}`),
}

// ============ QUIZ APIs ============
export const quizAPI = {
  get: (params) => api.get('/quiz', { params }), // video_id, video_title, skill_name
  submit: (data) => api.post('/quiz/submit', data), // quiz_id, answers, progress_id, node_id
}

export const announcementsAPI = {
  getAll: () => api.get('/announcements'),
}

export const roadmapTemplateAPI = {
  getPublished: () => api.get('/roadmap-templates'),
}

export const resumeAPI = {
  getAll: () => api.get('/resumes'),
  getOne: (id) => api.get(`/resumes/${id}`),
  generate: (data) => api.post('/resumes/generate', data),
  improveExisting: (formData) => api.post('/resumes/improve-existing', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  download: (id, format = 'pdf') => api.get(`/resumes/${id}/download`, {
    params: { format },
    responseType: 'blob',
  }),
  uploadPhoto: (id, formData) => api.post(`/resumes/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export default api
