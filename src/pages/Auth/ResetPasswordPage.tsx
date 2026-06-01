import { KeyRound, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { AuthAlert } from './components/AuthAlert'
import { AuthBackLink } from './components/AuthBackLink'
import { AuthCard } from './components/AuthCard'
import { AuthHeader } from './components/AuthHeader'
import { AuthLayout } from './components/AuthLayout'
import { AuthPasswordField } from './components/AuthPasswordField'
import { useResetPasswordViewModel } from './ResetPasswordPage.viewmodel'

export function ResetPasswordPage() {
  const { form, onSubmit, isLoading, token } = useResetPasswordViewModel()
  const {
    register,
    formState: { errors },
  } = form

  return (
    <AuthLayout>
      <AuthCard>
        <AuthBackLink to="/login" />

        <div className="mt-6">
          <AuthHeader
            icon={KeyRound}
            title="Reset Password"
            subtitle="Choose a strong new password for your account."
          />
        </div>

        {!token && (
          <AuthAlert variant="warning" className="mt-6">
            Reset token is missing. Please use the link from your email.
          </AuthAlert>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <AuthPasswordField
            label="New Password"
            registration={register('password')}
            error={errors.password}
            autoComplete="new-password"
          />

          <AuthPasswordField
            label="Confirm Password"
            registration={register('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            size="lg"
            className="w-full shadow-sm"
            disabled={isLoading || !token}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
