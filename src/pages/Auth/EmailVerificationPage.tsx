import { Link } from 'react-router-dom'
import { CheckCircle2, Loader2, MailCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { AuthAlert } from './components/AuthAlert'
import { AuthCard } from './components/AuthCard'
import { AuthHeader } from './components/AuthHeader'
import { AuthLayout } from './components/AuthLayout'
import { maskEmail } from './auth.utils'
import { useEmailVerificationViewModel } from './EmailVerificationPage.viewmodel'

export function EmailVerificationPage() {
  const { isVerifying, isSuccess, error, email, onResend, isResending } =
    useEmailVerificationViewModel()

  return (
    <AuthLayout>
      <AuthCard>
        {isVerifying && (
          <div className="py-6 text-center">
            <AuthHeader
              icon={MailCheck}
              title="Verify Your Email"
              subtitle="Hang tight while we confirm your email address."
              centered
            />
            <div className="mt-10 flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-accent" />
              <p className="mt-4 text-sm text-secondary">Verifying your email...</p>
            </div>
          </div>
        )}

        {!isVerifying && isSuccess && (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--state-success-bg)]">
              <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.5} />
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-primary">Email verified!</h1>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Your email has been verified successfully. You can now sign in to your account.
            </p>
            <Link to="/login" className="mt-8 inline-block">
              <Button size="lg" className="shadow-sm">
                Continue to Login
              </Button>
            </Link>
          </div>
        )}

        {!isVerifying && !isSuccess && (
          <div className="py-2 text-center">
            <AuthHeader
              icon={MailCheck}
              title="Verify Your Email"
              subtitle={
                email
                  ? `We sent a verification link to ${maskEmail(email)}`
                  : 'Check your inbox for a verification link.'
              }
              centered
            />

            <div className="mt-8 rounded-lg border border-border bg-surface-alt px-4 py-5">
              <p className="text-sm text-secondary">
                Didn&apos;t receive the email? Check your spam folder or request a new link below.
              </p>
            </div>

            {error && <AuthAlert className="mt-5">{error}</AuthAlert>}

            <Button
              type="button"
              size="lg"
              className="mt-6 w-full shadow-sm"
              onClick={() => void onResend()}
              disabled={!email || isResending}
            >
              {isResending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Resend Email'
              )}
            </Button>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  )
}
