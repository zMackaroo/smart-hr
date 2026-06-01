import { Navigate } from 'react-router-dom'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { AuthCard } from './components/AuthCard'
import { AuthHeader } from './components/AuthHeader'
import { AuthLayout } from './components/AuthLayout'
import { TwoFactorCodeInput } from './components/TwoFactorCodeInput'
import { useTwoFactorViewModel } from './TwoFactorPage.viewmodel'

export function TwoFactorPage() {
  const { form, onSubmit, isLoading, error, twoFactorEmail } = useTwoFactorViewModel()
  const {
    setValue,
    watch,
    formState: { errors },
  } = form

  if (!twoFactorEmail) {
    return <Navigate to="/login" replace />
  }

  const code = watch('code')

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          icon={ShieldCheck}
          title="2-Step Verification"
          subtitle="Enter the 6-digit code from your authenticator app to continue."
          centered
        />

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <TwoFactorCodeInput
            value={code}
            onChange={(value) =>
              setValue('code', value, { shouldValidate: true, shouldDirty: true })
            }
            error={errors.code?.message ?? error ?? undefined}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full shadow-sm"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              'Verify'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Signing in as <span className="font-medium text-secondary">{twoFactorEmail}</span>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
