import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { authAPI } from '../services/api'
import { AuthShell } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
const RegisterPage = () => {
  const [searchParams] = useSearchParams()

  useDocumentMeta({
    title: 'Create account | NextStep',
    description: 'Create your NextStep account.',
    robots: 'noindex, follow',
  })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      })
      toast.success('Account created.')
      const destination = searchParams.get('target_role')?.trim()
        ? `/analyze?${searchParams.toString()}`
        : '/dashboard'
      navigate(destination)
    } catch (error) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors
        const firstError = Object.values(apiErrors)[0][0]
        toast.error(firstError)
      } else {
        toast.error(error.response?.data?.message || 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field) => (event) => {
    setFormData((currentState) => ({ ...currentState, [field]: event.target.value }))
  }

  const handleGoogleLogin = () => {
    authAPI.googleLogin()
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Add your details below. You can change your profile later."

      footer={
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Already registered?{' '}
          <Link to={`/login${searchParams.size ? `?${searchParams.toString()}` : ''}`} className="font-medium text-[var(--brand-blue)] hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={updateField('name')}
            className="input-field"
            placeholder="Alex Morgan"
            required
          />
        </div>

        <div>
          <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={updateField('email')}
            className="input-field"
            placeholder="you@company.com"
            required
          />
        </div>

        <div>
          <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
              onChange={updateField('password')}
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
          <label htmlFor="register-confirm" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="register-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={updateField('confirmPassword')}
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
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[var(--border-soft)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[var(--surface)] px-3 text-xs text-[var(--text-muted)]">or</span>
          </div>
        </div>

        <button type="button" onClick={handleGoogleLogin} className="btn-secondary w-full justify-center py-3">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </form>
    </AuthShell>
  )
}

export default RegisterPage
