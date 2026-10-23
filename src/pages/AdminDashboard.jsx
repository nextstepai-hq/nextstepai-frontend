import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Award, Map, Activity, Trash2, Search, LayoutDashboard, ShieldCheck, Settings, Database, ClipboardCheck, Plus, X, BookOpen, Eye, Ban, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { EmptyState, LoadingScreen, PageContainer, PageIntro, SectionCard, StatCard } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import useAuthStore from '../store/authStore'
import AdminTools from '../components/AdminTools'

const AdminDashboard = () => {
  useDocumentMeta({
    title: 'Admin Dashboard | NextStep AI',
    description: 'Administrative controls for platform users, system stats, and content oversight.',
    robots: 'noindex, follow',
  })

  const [activeTab, setActiveTab] = useState('overview')
  const role = useAuthStore((state) => state.user?.role || 'user')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState('all')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userPage, setUserPage] = useState(1)
  const [userPages, setUserPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [filtering, setFiltering] = useState(false)
  const [reviews, setReviews] = useState([])
  const [certificates, setCertificates] = useState([])
  const [certificateSearch, setCertificateSearch] = useState('')
  const [certificatePage, setCertificatePage] = useState(1)
  const [certificatePages, setCertificatePages] = useState(1)
  const [quizzes, setQuizzes] = useState([])
  const [quizSearch, setQuizSearch] = useState('')
  const [quizPage, setQuizPage] = useState(1)
  const [quizPages, setQuizPages] = useState(1)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [quizQuestionsText, setQuizQuestionsText] = useState('[]')
  const [courses, setCourses] = useState([])
  const [courseSearch, setCourseSearch] = useState('')
  const [courseStatusFilter, setCourseStatusFilter] = useState('all')
  const [coursePage, setCoursePage] = useState(1)
  const [coursePages, setCoursePages] = useState(1)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: 'Web Development', level: 'beginner', duration_hours: 0, price: 0, instructor_id: 'admin', is_published: true })
  const [editingCourse, setEditingCourse] = useState(null)
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [newLesson, setNewLesson] = useState({ title: '', description: '', content: '', video_url: '', duration_minutes: 0, order: 1, is_published: true })

  useEffect(() => {
    fetchAdminData()
    if (['admin', 'super_admin', 'support_agent'].includes(role)) fetchUsers()
    if (['admin', 'super_admin', 'instructor', 'support_agent'].includes(role)) fetchReviews()
    if (['admin', 'super_admin', 'support_agent'].includes(role)) fetchCertificates()
    if (['admin', 'super_admin', 'content_manager', 'instructor'].includes(role)) {
      fetchCourses()
      fetchQuizzes()
    }
    // Filter changes are loaded by explicit controls; permissions are fixed for this mounted session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  const fetchCourses = async (filters = {}) => {
    try {
      const response = await adminAPI.getCourses({
        search: courseSearch,
        status: courseStatusFilter,
        page: coursePage,
        ...filters,
      })
      setCourses(response.data.data || [])
      setCoursePage(response.data.page || 1)
      setCoursePages(response.data.pages || 1)
    } catch (error) {
      toast.error('Failed to load courses')
    }
  }

  const fetchAdminData = async () => {
    try {
      const statsResponse = await adminAPI.getStats()
      setStats(statsResponse.data)
    } catch (error) {
      toast.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (filters = {}) => {
    setFiltering(true)
    try {
      const usersResponse = await adminAPI.getUsers({
        search: searchTerm,
        status: userStatusFilter,
        role: userRoleFilter,
        page: userPage,
        ...filters,
      })
      setUsers(usersResponse.data.data || [])
      setUserPages(usersResponse.data.pages || 1)
      setUserPage(usersResponse.data.page || 1)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setFiltering(false)
    }
  }

  const loadUser = async (id) => {
    try {
      const response = await adminAPI.getUser(id)
      setSelectedUser(response.data)
    } catch (error) {
      toast.error('Failed to load user profile')
    }
  }

  const handleUpdateUserStatus = async (id, status) => {
    try {
      await adminAPI.updateUserStatus(id, status)
      toast.success(status === 'suspended' ? 'Account suspended' : 'Account activated')
      await fetchUsers()
      if (selectedUser?.user?.id === id) await loadUser(id)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update account status')
    }
  }

  const handleExportUsers = async () => {
    try {
      const response = await adminAPI.exportUsers({ search: searchTerm, status: userStatusFilter, role: userRoleFilter })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = 'nextstep-users.csv'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to export users')
    }
  }

  const handleTriggerPasswordReset = async (id) => {
    if (!window.confirm('Send a password reset email using the existing account recovery workflow?')) return
    try {
      const response = await adminAPI.triggerPasswordReset(id)
      toast.success(response.data.message || 'Password reset email requested')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request a password reset')
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await adminAPI.getPracticeReviews()
      setReviews(response.data.reviews || [])
    } catch (error) {
      toast.error('Failed to load review queue')
    }
  }

  const fetchCertificates = async (filters = {}) => {
    try {
      const response = await adminAPI.getCertificates({
        per_page: 20,
        search: certificateSearch,
        page: certificatePage,
        ...filters,
      })
      setCertificates(response.data.data || [])
      setCertificatePage(response.data.page || 1)
      setCertificatePages(response.data.pages || 1)
    } catch (error) {
      toast.error('Failed to load certificates')
    }
  }

  const fetchQuizzes = async (filters = {}) => {
    try {
      const response = await adminAPI.getQuizzes({
        per_page: 20,
        search: quizSearch,
        page: quizPage,
        ...filters,
      })
      setQuizzes(response.data.data || [])
      setQuizPage(response.data.page || 1)
      setQuizPages(response.data.pages || 1)
    } catch (error) {
      toast.error('Failed to load quizzes')
    }
  }

  const handleSaveQuiz = async (event) => {
    event.preventDefault()
    try {
      const questions = JSON.parse(quizQuestionsText)
      if (!Array.isArray(questions)) throw new Error('Questions must be a JSON array.')
      const payload = { ...editingQuiz, questions }
      if (editingQuiz._id) {
        await adminAPI.updateQuiz(editingQuiz._id, payload)
      } else {
        await adminAPI.createQuiz(payload)
      }
      toast.success('Quiz saved')
      setEditingQuiz(null)
      fetchQuizzes()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save quiz')
    }
  }

  const handleRevokeCertificate = async (certificate) => {
    const reason = window.prompt(`Enter a reason for revoking ${certificate.certificate_code}:`)
    if (!reason?.trim()) return
    try {
      await adminAPI.deleteCertificate(certificate.id, reason.trim())
      toast.success('Certificate revoked')
      fetchCertificates()
      fetchAdminData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke certificate')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      await adminAPI.deleteUser(id)
      toast.success('User deleted successfully')
      fetchUsers()
      fetchAdminData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleUpdateRole = async (id, newRole) => {
    try {
      await adminAPI.updateRole(id, newRole)
      toast.success('User role updated')
      await fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role')
    }
  }

  const handleReview = async (progressId, taskId, status) => {
    try {
      await adminAPI.reviewPracticeTask(progressId, {
        task_id: taskId,
        status,
        mentor_feedback: status === 'approved' ? 'Good practical proof. Keep building on this.' : 'Needs revision. Improve clarity, polish, and practical explanation.',
      })
      toast.success('Practice task reviewed')
      fetchReviews()
    } catch (error) {
      toast.error('Failed to review task')
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.createCourse(newCourse)
      toast.success('Course created successfully')
      setShowCourseForm(false)
      fetchCourses()
    } catch (error) {
      toast.error('Failed to create course')
    }
  }

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Archive this course? Learner records will be preserved and the course will no longer be public.')) return
    try {
      await adminAPI.deleteCourse(id)
      toast.success('Course archived')
      fetchCourses()
    } catch (error) {
      toast.error('Failed to delete course')
    }
  }

  const handleUpdateCourse = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.updateCourse(editingCourse._id, editingCourse)
      toast.success('Course updated')
      setEditingCourse(null)
      fetchCourses()
    } catch (error) {
      toast.error('Failed to update course')
    }
  }

  const handleAddLesson = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.addLesson(editingCourse._id, newLesson)
      toast.success('Lesson added')
      setShowLessonForm(false)
      setNewLesson({ title: '', description: '', content: '', video_url: '', duration_minutes: 0, order: newLesson.order + 1, is_published: true })
      
      const response = await adminAPI.getCourse(editingCourse._id)
      setEditingCourse(response.data.data)
    } catch (error) {
      toast.error('Failed to add lesson')
    }
  }

  const handleToggleLesson = async (lesson) => {
    try {
      await adminAPI.updateLesson(lesson._id, { is_published: !lesson.is_published })
      const response = await adminAPI.getCourse(editingCourse._id)
      setEditingCourse(response.data.data)
      toast.success(lesson.is_published ? 'Lesson unpublished' : 'Lesson published')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update lesson')
    }
  }

  const handleToggleCourse = async (course) => {
    try {
      const changes = course.is_archived
        ? { is_archived: false, is_published: true }
        : { is_published: !course.is_published }
      await adminAPI.updateCourse(course._id, changes)
      toast.success(course.is_archived ? 'Course restored and published' : course.is_published ? 'Course moved to draft' : 'Course published')
      fetchCourses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course')
    }
  }

  const loadCourseForEditing = async (courseId) => {
    try {
      const response = await adminAPI.getCourse(courseId)
      setEditingCourse(response.data.data)
    } catch (error) {
      toast.error('Failed to load course details')
    }
  }


  if (loading) {
    return <LoadingScreen label="Loading admin dashboard..." />
  }

  const isFullAdmin = ['admin', 'super_admin'].includes(role)
  const isSuperAdmin = role === 'super_admin'
  const navigation = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview', roles: ['admin', 'super_admin', 'content_manager', 'instructor', 'support_agent'] },
    { id: 'users', icon: Users, label: 'User Management', roles: ['admin', 'super_admin', 'support_agent'] },
    { id: 'content', icon: Database, label: 'System Content', roles: ['admin', 'super_admin', 'content_manager', 'instructor'] },
    { id: 'certificates', icon: Award, label: 'Certificates', roles: ['admin', 'super_admin', 'support_agent'] },
    { id: 'quizzes', icon: ClipboardCheck, label: 'Quiz Management', roles: ['admin', 'super_admin', 'content_manager', 'instructor'] },
    { id: 'reviews', icon: ClipboardCheck, label: 'Practice Reviews', roles: ['admin', 'super_admin', 'instructor', 'support_agent'] },
    { id: 'operations', icon: Settings, label: 'CMS & Reports', roles: ['admin', 'super_admin', 'content_manager', 'instructor'] },
  ].filter((item) => item.roles.includes(role))

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Admin dashboard"
        title="Platform management"
        description="Review system health, inspect platform usage, and manage user access from a cleaner responsive panel."
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <SectionCard className="h-fit">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-charcoal)] text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-lg font-bold">Admin Panel</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Management suite</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  activeTab === item.id
                    ? 'bg-[var(--brand-charcoal)] text-white'
                    : 'bg-[var(--surface)] text-[var(--text-secondary)]'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-[1.4rem] bg-[var(--surface)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">System status</p>
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-green)]" />
              All systems operational
            </div>
          </div>
        </SectionCard>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div key="overview" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Users} label="Total Users" value={stats?.total_users || 0} tone="blue" />
                <StatCard icon={Users} label="Active Users" value={stats?.active_users || 0} tone="green" />
                <StatCard icon={Ban} label="Suspended Users" value={stats?.suspended_users || 0} tone="orange" />
                <StatCard icon={Map} label="Total Roadmaps" value={stats?.total_roadmaps || 0} tone="lilac" />
                <StatCard icon={BookOpen} label="Published Courses" value={stats?.published_courses || 0} tone="blue" />
                <StatCard icon={BookOpen} label="Lessons" value={stats?.total_lessons || 0} tone="green" />
                <StatCard icon={ClipboardCheck} label="Quizzes" value={stats?.total_quizzes || 0} tone="lilac" />
                <StatCard icon={Award} label="Certificates Issued" value={stats?.total_certificates || 0} tone="orange" />
                <StatCard icon={Activity} label="Active Today" value={stats?.active_today || 0} tone="green" />
              </div>

              <SectionCard className="mt-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">Recent registrations</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Newest accounts recorded in the platform.</p>
                </div>
                {stats?.recent_registrations?.length ? (
                  <ul className="divide-y divide-[var(--border-soft)]">
                    {stats.recent_registrations.map((entry) => (
                      <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                        <span><strong>{entry.name}</strong><span className="ml-2 text-sm text-[var(--text-secondary)]">{entry.email}</span></span>
                        <time className="text-sm text-[var(--text-muted)]">{entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'Date unavailable'}</time>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-8 text-center text-sm text-[var(--text-muted)]">No registrations have been recorded yet.</p>
                )}
              </SectionCard>
            </motion.div>
          ) : null}

          {activeTab === 'users' ? (
            <motion.div key="users" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <SectionCard>
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">User management</h2>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">Review account details, permissions, and account access.</p>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                    <div className="relative w-full lg:w-72">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') fetchUsers({ page: 1 })
                        }}
                        className="input-field pl-11"
                        placeholder="Search name or email"
                        aria-label="Search users"
                      />
                    </div>
                    <select
                      className="input-field sm:w-44"
                      value={userStatusFilter}
                      onChange={(event) => {
                        const status = event.target.value
                        setUserStatusFilter(status)
                        setUserPage(1)
                        fetchUsers({ status, page: 1 })
                      }}
                      aria-label="Filter accounts by status"
                    >
                      <option value="all">All accounts</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <select
                      className="input-field sm:w-48"
                      value={userRoleFilter}
                      onChange={(event) => {
                        const selectedRole = event.target.value
                        setUserRoleFilter(selectedRole)
                        setUserPage(1)
                        fetchUsers({ role: selectedRole, page: 1 })
                      }}
                      aria-label="Filter accounts by role"
                    >
                      <option value="all">All roles</option>
                      <option value="user">Learners</option>
                      <option value="content_manager">Content managers</option>
                      <option value="instructor">Instructors</option>
                      <option value="support_agent">Support agents</option>
                      <option value="admin">Administrators</option>
                      {isSuperAdmin ? <option value="super_admin">Super administrators</option> : null}
                    </select>
                    {isFullAdmin ? <button type="button" className="btn-secondary whitespace-nowrap" onClick={handleExportUsers}>Export CSV</button> : null}
                  </div>
                </div>

                {selectedUser ? (
                  <div className="mb-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">{selectedUser.user.name}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{selectedUser.user.email} · {selectedUser.user.role} · {selectedUser.user.status}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {isFullAdmin ? <button type="button" className="btn-secondary" onClick={() => handleTriggerPasswordReset(selectedUser.user.id)}>Send password reset</button> : null}
                        <button type="button" className="btn-secondary" onClick={() => setSelectedUser(null)}>Close profile</button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <p className="text-sm"><strong>{selectedUser.roadmaps?.length || 0}</strong> roadmaps</p>
                      <p className="text-sm"><strong>{selectedUser.enrollments?.length || 0}</strong> course enrollments</p>
                      <p className="text-sm"><strong>{selectedUser.certificates?.length || 0}</strong> certificates</p>
                      <p className="text-sm"><strong>{selectedUser.stats?.xp || 0} XP</strong> · Level {selectedUser.stats?.level || 1}</p>
                    </div>
                    {selectedUser.roadmaps?.length ? (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-bold">Career roadmaps and skill gaps</p>
                        <ul className="space-y-2">
                          {selectedUser.roadmaps.map((roadmap) => (
                            <li key={roadmap._id} className="rounded-xl bg-[var(--surface-strong)] p-3 text-sm">
                              <strong>{roadmap.target_role}</strong><span className="ml-2 text-[var(--text-muted)]">{roadmap.status || 'active'}</span>
                              <p className="mt-1 text-[var(--text-secondary)]">{(roadmap.skill_gaps || []).map((gap) => typeof gap === 'string' ? gap : gap.name || gap.skill_name).filter(Boolean).join(', ') || 'No stored skill-gap details.'}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {filtering ? (
                  <LoadingScreen label="Filtering users..." />
                ) : users.length === 0 ? (
                  <EmptyState icon={Users} title="No users found" description="No accounts match the current search criteria." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left">
                      <thead>
                        <tr className="border-b border-[var(--border-soft)] text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                          <th className="py-4 pr-4">User</th>
                          <th className="py-4 pr-4 text-center">Role</th>
                          <th className="py-4 pr-4 text-center">Status</th>
                          <th className="py-4 pr-4 text-center">Stats</th>
                          <th className="py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((entry) => (
                          <tr key={entry.id} className="border-b border-[var(--border-soft)]/70">
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-sky)] font-bold text-[var(--brand-charcoal)]">
                                  {(entry.name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold">{entry.name}</p>
                                  <p className="text-sm text-[var(--text-secondary)]">{entry.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4 text-center">
                              <span className="rounded-full bg-[var(--surface)] px-3 py-2 text-xs font-bold">
                                {entry.role || 'user'}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-center">
                              <span className={`rounded-full px-3 py-2 text-xs font-bold ${entry.status === 'suspended' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-700'}`}>
                                {entry.status || 'active'}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-center">
                              <p className="font-bold text-[var(--brand-orange)]">{entry.xp || 0} XP</p>
                              <p className="text-xs text-[var(--text-muted)]">Level {entry.level || 1}</p>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {isFullAdmin ? (
                                  <button type="button" aria-label={`View ${entry.name} profile`} onClick={() => loadUser(entry.id)} className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--brand-blue)]">
                                    <Eye size={16} />
                                  </button>
                                ) : null}
                                {!isFullAdmin ? <button type="button" onClick={() => handleTriggerPasswordReset(entry.id)} className="rounded-full px-2 py-1 text-xs font-bold text-[var(--brand-blue)] hover:bg-[var(--surface)]">Reset password</button> : null}
                                {isFullAdmin ? (
                                  <>
                                    <button type="button" aria-label={`${entry.status === 'suspended' ? 'Activate' : 'Suspend'} ${entry.name}`} onClick={() => handleUpdateUserStatus(entry.id, entry.status === 'suspended' ? 'active' : 'suspended')} className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--brand-blue)]">
                                      {entry.status === 'suspended' ? <CheckCircle size={16} /> : <Ban size={16} />}
                                    </button>
                                    <select
                                      aria-label={`Change ${entry.name} role`}
                                      className="input-field max-w-40 py-1 text-xs"
                                      value={entry.role || 'user'}
                                      disabled={!isSuperAdmin && ['admin', 'super_admin'].includes(entry.role)}
                                      onChange={(event) => handleUpdateRole(entry.id, event.target.value)}
                                    >
                                      <option value="user">Learner</option>
                                      <option value="content_manager">Content manager</option>
                                      <option value="instructor">Instructor</option>
                                      <option value="support_agent">Support agent</option>
                                      {isSuperAdmin || entry.role === 'admin' ? <option value="admin">Administrator</option> : null}
                                      {entry.role === 'super_admin' ? <option value="super_admin">Super administrator</option> : null}
                                    </select>
                                    <button type="button" onClick={() => handleDeleteUser(entry.id)} disabled={['admin', 'super_admin'].includes(entry.role)} className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-red-500 disabled:opacity-40">
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-[var(--text-muted)]">Page {userPage} of {userPages}</p>
                      <div className="flex gap-2">
                        <button type="button" className="btn-secondary" disabled={userPage <= 1} onClick={() => {
                          const page = userPage - 1
                          setUserPage(page)
                          fetchUsers({ page })
                        }}>Previous</button>
                        <button type="button" className="btn-secondary" disabled={userPage >= userPages} onClick={() => {
                          const page = userPage + 1
                          setUserPage(page)
                          fetchUsers({ page })
                        }}>Next</button>
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>
            </motion.div>
          ) : null}

          {activeTab === 'reviews' ? (
            <motion.div key="reviews" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <SectionCard>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold">Practice review queue</h2>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Approve or send back submitted mini projects and portfolio work.</p>
                </div>

                {reviews.length === 0 ? (
                  <EmptyState icon={ClipboardCheck} title="No reviews pending" description="Submitted assignment reviews will appear here." />
                ) : (
                  <div className="grid gap-4">
                    {reviews.map((item) => (
                      <div key={`${item.progress_id}-${item.task_id}`} className="rounded-[1.4rem] bg-[var(--surface)] p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm font-bold">{item.title}</p>
                            <p className="mt-1 text-sm text-[var(--brand-blue)]">{item.user_name} - {item.target_role}</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.submission_notes || 'No notes submitted.'}</p>
                            {item.portfolio_url ? <p className="mt-2 text-xs break-all text-[var(--text-secondary)]">Portfolio: {item.portfolio_url}</p> : null}
                            {item.submission_file_url ? <p className="mt-1 text-xs break-all text-[var(--text-secondary)]">File: {item.submission_file_url}</p> : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => handleReview(item.progress_id, item.task_id, 'approved')} className="btn-primary">
                              Approve
                            </button>
                            <button type="button" onClick={() => handleReview(item.progress_id, item.task_id, 'needs_revision')} className="btn-secondary">
                              Needs Revision
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </motion.div>
          ) : null}

          {activeTab === 'content' ? (
            <motion.div key="content" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <SectionCard>
                {editingCourse ? (
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">Edit Course: {editingCourse.title}</h2>
                        <button onClick={() => setEditingCourse(null)} className="text-sm text-[var(--brand-blue)] hover:underline mt-1 block">&larr; Back to all courses</button>
                      </div>
                      <button onClick={handleUpdateCourse} className="btn-primary">Save Changes</button>
                    </div>
                    
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-2xl border border-[var(--border-soft)] p-5">
                        <h3 className="font-bold mb-4">Course Details</h3>
                        <div className="grid gap-3">
                          <div>
                            <label className="text-xs font-semibold text-[var(--text-muted)]">Title</label>
                            <input className="input-field w-full mt-1" value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[var(--text-muted)]">Description</label>
                            <textarea className="input-field w-full mt-1 min-h-[80px]" value={editingCourse.description} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[var(--text-muted)]">Category</label>
                            <input className="input-field w-full mt-1" value={editingCourse.category || ''} onChange={e => setEditingCourse({...editingCourse, category: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-[var(--text-muted)]">Price</label>
                              <input type="number" className="input-field w-full mt-1" value={editingCourse.price} onChange={e => setEditingCourse({...editingCourse, price: parseFloat(e.target.value)})} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[var(--text-muted)]">Level</label>
                              <select className="input-field w-full mt-1" value={editingCourse.level} onChange={e => setEditingCourse({...editingCourse, level: e.target.value})}>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[var(--text-muted)]">Duration (hours)</label>
                              <input type="number" min="0" className="input-field w-full mt-1" value={editingCourse.duration_hours || 0} onChange={e => setEditingCourse({...editingCourse, duration_hours: Number(e.target.value)})} />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-sm font-semibold">
                            <input type="checkbox" checked={Boolean(editingCourse.is_published)} onChange={e => setEditingCourse({...editingCourse, is_published: e.target.checked})} />
                            Published and visible to learners
                          </label>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--border-soft)] p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold">Lessons Curriculum</h3>
                          <button onClick={() => setShowLessonForm(!showLessonForm)} className="text-[var(--brand-blue)] text-sm font-bold flex items-center gap-1">
                            {showLessonForm ? <X size={14} /> : <Plus size={14} />} {showLessonForm ? 'Cancel' : 'Add Lesson'}
                          </button>
                        </div>

                        {showLessonForm && (
                          <form onSubmit={handleAddLesson} className="mb-4 rounded-xl border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/5 p-4 grid gap-3">
                            <input required placeholder="Lesson Title" className="input-field w-full text-sm py-2" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} />
                            <input type="url" placeholder="Video URL (optional when lesson text is provided)" className="input-field w-full text-sm py-2" value={newLesson.video_url} onChange={e => setNewLesson({...newLesson, video_url: e.target.value})} />
                            <textarea placeholder="Lesson text/content (optional when video URL is provided)" className="input-field w-full text-sm py-2" value={newLesson.content} onChange={e => setNewLesson({...newLesson, content: e.target.value})} />
                            <div className="flex gap-2">
                              <input required type="number" min="0" placeholder="Mins" className="input-field w-full text-sm py-2" value={newLesson.duration_minutes || ''} onChange={e => setNewLesson({...newLesson, duration_minutes: Number(e.target.value)})} />
                              <select aria-label="Lesson publication status" className="input-field w-full text-sm py-2" value={newLesson.is_published ? 'published' : 'draft'} onChange={e => setNewLesson({...newLesson, is_published: e.target.value === 'published'})}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                              </select>
                              <button type="submit" className="bg-[var(--brand-blue)] text-white font-bold rounded-lg px-4 text-sm w-full">Add</button>
                            </div>
                          </form>
                        )}

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {!editingCourse.lessons || editingCourse.lessons.length === 0 ? (
                            <p className="text-sm text-[var(--text-muted)] italic">No lessons added yet.</p>
                          ) : (
                            editingCourse.lessons.map((lesson, idx) => (
                              <div key={lesson._id} className="flex items-center justify-between bg-[var(--surface-strong)] p-3 rounded-xl">
                                <div>
                                  <p className="font-semibold text-sm">{idx + 1}. {lesson.title}</p>
                                  <p className="text-xs text-[var(--text-muted)]">{lesson.duration_minutes} mins · {lesson.is_published ? 'Published' : 'Draft'}</p>
                                </div>
                                <button type="button" aria-label={`${lesson.is_published ? 'Unpublish' : 'Publish'} lesson ${lesson.title}`} onClick={() => handleToggleLesson(lesson)} className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--brand-blue)]">
                                  {lesson.is_published ? <Ban size={14} /> : <CheckCircle size={14} />}
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">Course Management</h2>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">Create, update, and manage public courses.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <input aria-label="Search courses" type="search" className="input-field sm:w-56" placeholder="Search courses" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} onKeyDown={(event) => {
                          if (event.key === 'Enter') fetchCourses({ page: 1 })
                        }} />
                        <select aria-label="Filter courses by status" className="input-field sm:w-40" value={courseStatusFilter} onChange={(event) => {
                          const status = event.target.value
                          setCourseStatusFilter(status)
                          setCoursePage(1)
                          fetchCourses({ status, page: 1 })
                        }}>
                          <option value="all">Active content</option>
                          <option value="published">Published</option>
                          <option value="draft">Drafts</option>
                          <option value="archived">Archived</option>
                        </select>
                        <button onClick={() => setShowCourseForm(!showCourseForm)} className="btn-primary flex items-center gap-2">
                          {showCourseForm ? <X size={16} /> : <Plus size={16} />}
                          {showCourseForm ? 'Cancel' : 'New Course'}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showCourseForm && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-8 overflow-hidden rounded-[1.4rem] border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/5 p-5">
                          <h3 className="mb-4 text-lg font-bold">Add New Course</h3>
                          <form onSubmit={handleCreateCourse} className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <label className="mb-1 block text-sm font-semibold">Course Title</label>
                              <input required type="text" className="input-field w-full" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-1 block text-sm font-semibold">Description</label>
                              <textarea required className="input-field w-full min-h-[100px]" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold">Category</label>
                              <input required type="text" className="input-field w-full" value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold">Level</label>
                              <select className="input-field w-full" value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                              </select>
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold">Duration (Hours)</label>
                              <input required type="number" min="0" className="input-field w-full" value={newCourse.duration_hours} onChange={(e) => setNewCourse({ ...newCourse, duration_hours: parseInt(e.target.value) })} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold">Price ($)</label>
                              <input required type="number" min="0" step="0.01" className="input-field w-full" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold">Publication status</label>
                              <select className="input-field w-full" value={newCourse.is_published ? 'published' : 'draft'} onChange={(e) => setNewCourse({ ...newCourse, is_published: e.target.value === 'published' })}>
                                <option value="draft">Save as draft</option>
                                <option value="published">Publish now</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2 flex justify-end">
                              <button type="submit" className="btn-primary">{newCourse.is_published ? 'Publish Course' : 'Save Draft'}</button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {courses.length === 0 ? (
                      <EmptyState icon={BookOpen} title="No courses found" description="No courses match the selected search and status filters." />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {courses.map((course) => (
                          <div key={course._id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--brand-blue)]/30">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-[var(--brand-blue)]/10 px-3 py-1 text-xs font-bold text-[var(--brand-blue)]">{course.category}</span>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${course.is_archived ? 'bg-red-500/10 text-red-600' : course.is_published ? 'bg-green-500/10 text-green-700' : 'bg-orange-500/10 text-orange-700'}`}>{course.is_archived ? 'Archived' : course.is_published ? 'Published' : 'Draft'}</span>
                              </div>
                              <div className="flex gap-2">
                                <button type="button" aria-label={`${course.is_archived ? 'Restore' : course.is_published ? 'Unpublish' : 'Publish'} ${course.title}`} onClick={() => handleToggleCourse(course)} className="p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--brand-blue)]">
                                  {course.is_archived || !course.is_published ? <CheckCircle size={16} /> : <Ban size={16} />}
                                </button>
                                <button onClick={() => loadCourseForEditing(course._id)} className="text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition-colors p-1">
                                  <Settings size={16} />
                                </button>
                                <button onClick={() => handleDeleteCourse(course._id)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <h3 className="font-bold text-lg mb-1 cursor-pointer hover:text-[var(--brand-blue)] transition-colors" onClick={() => loadCourseForEditing(course._id)}>{course.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">{course.description}</p>
                            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
                              <span>{course.level} • {course.duration_hours}h</span>
                              <span className="text-[var(--text-primary)]">{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {coursePages > 1 ? (
                      <div className="mt-5 flex items-center justify-between">
                        <p className="text-sm text-[var(--text-muted)]">Page {coursePage} of {coursePages}</p>
                        <div className="flex gap-2">
                          <button type="button" className="btn-secondary" disabled={coursePage <= 1} onClick={() => {
                            const page = coursePage - 1
                            setCoursePage(page)
                            fetchCourses({ page })
                          }}>Previous</button>
                          <button type="button" className="btn-secondary" disabled={coursePage >= coursePages} onClick={() => {
                            const page = coursePage + 1
                            setCoursePage(page)
                            fetchCourses({ page })
                          }}>Next</button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </SectionCard>
            </motion.div>
          ) : null}

          {activeTab === 'certificates' ? (
            <motion.div key="certificates" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <SectionCard>
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Certificate management</h2>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">Review issued certificates and revoke invalid awards with a recorded reason.</p>
                  </div>
                  <input aria-label="Search certificates by code or learner" type="search" className="input-field sm:w-72" placeholder="Certificate code or learner" value={certificateSearch} onChange={(event) => setCertificateSearch(event.target.value)} onKeyDown={(event) => {
                    if (event.key === 'Enter') fetchCertificates({ page: 1 })
                  }} />
                </div>
                {certificates.length === 0 ? (
                  <EmptyState icon={Award} title="No certificates issued" description="Certificates issued after roadmap completion will appear here." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left">
                      <thead>
                        <tr className="border-b border-[var(--border-soft)] text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                          <th className="py-4 pr-4">Certificate</th>
                          <th className="py-4 pr-4">Learner</th>
                          <th className="py-4 pr-4">Issued</th>
                          <th className="py-4 pr-4">Status</th>
                          <th className="py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certificates.map((certificate) => (
                          <tr key={certificate.id} className="border-b border-[var(--border-soft)]/70">
                            <td className="py-4 pr-4 font-mono text-sm">{certificate.certificate_code}</td>
                            <td className="py-4 pr-4">{certificate.user_name}</td>
                            <td className="py-4 pr-4 text-sm">{certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString() : '—'}</td>
                            <td className="py-4 pr-4">{certificate.revoked_at ? 'Revoked' : 'Valid'}</td>
                            <td className="py-4 text-right">
                              {!certificate.revoked_at ? (
                                <button type="button" onClick={() => handleRevokeCertificate(certificate)} className="btn-secondary text-red-600">Revoke</button>
                              ) : (
                                <span className="text-xs text-[var(--text-muted)]">{certificate.revocation_reason}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {certificatePages > 1 ? (
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-[var(--text-muted)]">Page {certificatePage} of {certificatePages}</p>
                        <div className="flex gap-2">
                          <button type="button" className="btn-secondary" disabled={certificatePage <= 1} onClick={() => {
                            const page = certificatePage - 1
                            setCertificatePage(page)
                            fetchCertificates({ page })
                          }}>Previous</button>
                          <button type="button" className="btn-secondary" disabled={certificatePage >= certificatePages} onClick={() => {
                            const page = certificatePage + 1
                            setCertificatePage(page)
                            fetchCertificates({ page })
                          }}>Next</button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </SectionCard>
            </motion.div>
          ) : null}

          {activeTab === 'quizzes' ? (
            <motion.div key="quizzes" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <SectionCard>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">Quiz management</h2>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">Manage existing video quizzes and their server-validated answer keys.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input aria-label="Search quizzes" type="search" className="input-field sm:w-56" placeholder="Search quiz or skill" value={quizSearch} onChange={(event) => setQuizSearch(event.target.value)} onKeyDown={(event) => {
                      if (event.key === 'Enter') fetchQuizzes({ page: 1 })
                    }} />
                    <button type="button" className="btn-primary" onClick={() => {
                      setEditingQuiz({ video_id: '', video_title: '', skill_name: '', questions: [] })
                      setQuizQuestionsText('[]')
                    }}>New Quiz</button>
                  </div>
                </div>
                {editingQuiz ? (
                  <form onSubmit={handleSaveQuiz} className="mb-6 grid gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="text-sm font-semibold">Video ID<input required className="input-field mt-1 w-full" value={editingQuiz.video_id} onChange={(event) => setEditingQuiz({ ...editingQuiz, video_id: event.target.value })} /></label>
                      <label className="text-sm font-semibold">Video title<input required className="input-field mt-1 w-full" value={editingQuiz.video_title} onChange={(event) => setEditingQuiz({ ...editingQuiz, video_title: event.target.value })} /></label>
                      <label className="text-sm font-semibold">Skill<input required className="input-field mt-1 w-full" value={editingQuiz.skill_name} onChange={(event) => setEditingQuiz({ ...editingQuiz, skill_name: event.target.value })} /></label>
                    </div>
                    <label className="text-sm font-semibold">
                      Questions (JSON array: question, options, correct_answer, explanation)
                      <textarea required rows={12} className="input-field mt-1 w-full font-mono text-xs" value={quizQuestionsText} onChange={(event) => setQuizQuestionsText(event.target.value)} />
                    </label>
                    <p className="text-xs text-[var(--text-muted)]">Each answer key must exactly match one of its options. Question edits do not rewrite learner progress or saved attempt history.</p>
                    <div className="flex justify-end gap-2">
                      <button type="button" className="btn-secondary" onClick={() => setEditingQuiz(null)}>Cancel</button>
                      <button type="submit" className="btn-primary">Save Quiz</button>
                    </div>
                  </form>
                ) : null}
                {quizzes.length === 0 ? (
                  <EmptyState icon={ClipboardCheck} title="No quizzes found" description="Quizzes created by existing learner workflows will appear here." />
                ) : (
                  <div className="divide-y divide-[var(--border-soft)]">
                    {quizzes.map((quiz) => (
                      <div key={quiz._id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                        <div>
                          <p className="font-bold">{quiz.video_title}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{quiz.skill_name} · {quiz.questions?.length || 0} questions</p>
                        </div>
                        <button type="button" className="btn-secondary" onClick={() => {
                          setEditingQuiz(quiz)
                          setQuizQuestionsText(JSON.stringify(quiz.questions || [], null, 2))
                        }}>Edit quiz</button>
                      </div>
                    ))}
                  </div>
                )}
                {!editingQuiz && quizPages > 1 ? (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-[var(--text-muted)]">Page {quizPage} of {quizPages}</p>
                    <div className="flex gap-2">
                      <button type="button" className="btn-secondary" disabled={quizPage <= 1} onClick={() => {
                        const page = quizPage - 1
                        setQuizPage(page)
                        fetchQuizzes({ page })
                      }}>Previous</button>
                      <button type="button" className="btn-secondary" disabled={quizPage >= quizPages} onClick={() => {
                        const page = quizPage + 1
                        setQuizPage(page)
                        fetchQuizzes({ page })
                      }}>Next</button>
                    </div>
                  </div>
                ) : null}
              </SectionCard>
            </motion.div>
          ) : null}

          {activeTab === 'operations' ? (
            <motion.div key="operations" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <AdminTools role={role} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </PageContainer>
  )
}

export default AdminDashboard
