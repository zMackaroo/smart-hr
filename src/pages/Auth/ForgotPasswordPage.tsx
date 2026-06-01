import { Link } from 'react-router-dom'
import { CheckCircle2, KeyRound, Loader2, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { AuthBackLink } from './components/AuthBackLink'
import { AuthCard } from './components/AuthCard'
import { AuthHeader } from './components/AuthHeader'
import { AuthInput } from './components/AuthInput'
import { AuthLayout } from './components/AuthLayout'
import { useForgotPasswordViewModel } from './ForgotPasswordPage.viewmodel'

export function ForgotPasswordPage() {
  const { form, onSubmit, isLoading, isSubmitted } = useForgotPasswordViewModel()
  const {
    register,
    formState: { errors },
  } = form

  return (
    <AuthLayout>
      <AuthCard>
        <AuthBackLink to="/login" />

        {isSubmitted ? (
          <div className="mt-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--state-success-bg)]">
              <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.5} />
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-primary">Check your email</h1>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              If that email exists in our system, we&apos;ve sent you a password reset link.
            </p>
            <Link to="/login" className="mt-8 inline-block">
              <Button variant="outline" size="lg">
                Back to login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <AuthHeader
                icon={KeyRound}
                title="Forgot Password"
                subtitle="Enter your email and we'll send you a reset link."
              />
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <AuthInput
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                icon={Mail}
                error={errors.email?.message}
                {...register('email')}
              />

              <Button type="submit" size="lg" className="w-full shadow-sm" disabled={isLoading}>
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  )
}
