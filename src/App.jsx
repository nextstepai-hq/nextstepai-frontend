import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import Navbar from './components/Navbar'
import SiteFooter from './components/SiteFooter'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import { useTheme } from './components/ThemeProvider'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import AnalyzePage from './pages/AnalyzePage'
import RoadmapsPage from './pages/RoadmapsPage'
import RoadmapDetailPage from './pages/RoadmapDetailPage'
import ProgressPage from './pages/ProgressPage'
import CertificatesPage from './pages/CertificatesPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import GoogleCallbackPage from './pages/GoogleCallbackPage'
import CertificateVerifyPage from './pages/CertificateVerifyPage'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ResumeBuilderPage from './pages/ResumeBuilderPage'
import PortfolioShowcasePage from './pages/PortfolioShowcasePage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import QuizPage from './pages/QuizPage'

function AppContent() {
  const { pathname } = useLocation()
  const { isDark } = useTheme()
  const prefersReducedMotion = useReducedMotion()
  const [videoUnavailable, setVideoUnavailable] = useState(false)
  const showVideoBackground = pathname !== '/' && isDark

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)',
          },
        }}
      />
      <div className={`app-shell flex min-h-screen flex-col${showVideoBackground ? ' app-shell--video' : ''}`}>
        {showVideoBackground ? (
          <div className="app-shell__background" aria-hidden="true">
            {!prefersReducedMotion && !videoUnavailable ? (
              <video
                className="app-shell__background-video"
                src="/nextstep-bg.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onError={() => setVideoUnavailable(true)}
              />
            ) : null}
            <div className="app-shell__background-overlay" />
          </div>
        ) : null}
        <div className="app-shell__content flex-1">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="/certificates/verify/:id" element={<CertificateVerifyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Protected Routes */}
          <Route element={<><Navbar /><ProtectedRoute /></>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/roadmaps" element={<RoadmapsPage />} />
            <Route path="/roadmap/:id" element={<RoadmapDetailPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/resume-builder" element={<ResumeBuilderPage />} />
            <Route path="/portfolio-showcase" element={<PortfolioShowcasePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/course/:id" element={<CourseDetailPage />} />
            <Route path="/quiz" element={<QuizPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<><Navbar /><AdminRoute /></>}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <SiteFooter />
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
