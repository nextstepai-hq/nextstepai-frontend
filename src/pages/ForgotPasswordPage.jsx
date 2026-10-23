import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { AuthShell } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const ForgotPasswordPage = () => {
  useDocumentMeta({
    title: 'Forgot Password | NextStep',
    description: 'Reset your NextStep password.',
    robots: 'noindex, follow',
  })

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await authAPI.forgotPassword(email)
      setSent(true)
      toast.success('If an account exists, a reset link has been sent to your email.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we’ll send you a link to reset your password."

      footer={
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-[var(--brand-blue)] hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-green)]/10 text-[var(--brand-green)]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Check your email</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            We’ve sent a password reset link to <strong>{email}</strong>. It expires in 60 minutes.
          </p>
          <Link to="/login" className="btn-primary w-full justify-center py-3">
            Go to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input-field"
              placeholder="you@company.com"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full justify-center py-3">
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}

export default ForgotPasswordPage
