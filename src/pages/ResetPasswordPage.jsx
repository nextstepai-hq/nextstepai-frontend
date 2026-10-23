import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { AuthShell } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const ResetPasswordPage = () => {
  useDocumentMeta({
    title: 'Reset Password | NextStep',
    description: 'Set a new password for your NextStep account.',
    robots: 'noindex, follow',
  })

  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      toast.error('No reset token provided. Please request a new reset link.')
      navigate('/forgot-password')
    }
  }, [token, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      await authAPI.resetPassword({ email, token, password })
      toast.success('Your password has been reset successfully.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Choose a new password for your account."

      footer={
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Back to{' '}
          <Link to="/login" className="font-medium text-[var(--brand-blue)] hover:underline">
            sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-password" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            New password
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-field pr-11"
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword((currentState) => !currentState)}
              className="absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="reset-confirm-password" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="input-field pr-11"
              placeholder="Repeat password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((currentState) => !currentState)}
              className="absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full justify-center py-3">
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </AuthShell>
  )
}

export default ResetPasswordPage
