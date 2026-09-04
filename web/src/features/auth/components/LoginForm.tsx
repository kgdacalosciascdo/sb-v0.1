import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import type { LoginErrors } from '../types/auth'
import { setDemoAuthenticated } from '../utils/demoAuth'

export function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  function validate() {
    const nextErrors: LoginErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'Enter your email address.'
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      nextErrors.password = 'Enter your password.'
    }

    return nextErrors
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    window.setTimeout(() => {
      // Temporary preview-only flow. It stores an auth flag, never credentials.
      setDemoAuthenticated(rememberMe)
      navigate('/dashboard', { replace: true })
    }, 300)
  }

  function handleForgotPassword() {
    setNotice('Password recovery will be connected when Laravel authentication is added.')
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-ink-700" htmlFor="email">
          Email address
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
            size={18}
          />
          <input
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className={cn(
              'w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-500/70',
              'focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
              errors.email ? 'border-red-400 ring-4 ring-red-50' : 'border-ink-200',
            )}
            id="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            type="email"
            value={email}
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs font-medium text-red-600" id="email-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink-700" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
            size={18}
          />
          <input
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-invalid={Boolean(errors.password)}
            autoComplete="current-password"
            className={cn(
              'w-full rounded-xl border bg-white py-3 pl-11 pr-12 text-sm text-ink-900 outline-none transition placeholder:text-ink-500/70',
              'focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
              errors.password ? 'border-red-400 ring-4 ring-red-50' : 'border-ink-200',
            )}
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            value={password}
          />
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? <EyeOff aria-hidden="true" size={17} /> : <Eye aria-hidden="true" size={17} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs font-medium text-red-600" id="password-error" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-ink-500">
          <input
            checked={rememberMe}
            className="size-4 rounded border-ink-300 text-brand-600 accent-brand-600 focus:ring-brand-500"
            onChange={(event) => setRememberMe(event.target.checked)}
            type="checkbox"
          />
          Remember me
        </label>
        <button
          className="font-semibold text-brand-700 underline-offset-4 transition hover:text-brand-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          onClick={handleForgotPassword}
          type="button"
        >
          Forgot password?
        </button>
      </div>

      {notice && (
        <p className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-xs leading-5 text-brand-800" role="status">
          {notice}
        </p>
      )}

      <button
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-wait disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
            Signing in...
          </>
        ) : (
          <>
            Sign in
            <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" size={18} />
          </>
        )}
      </button>
    </form>
  )
}
