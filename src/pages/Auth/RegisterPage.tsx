import { Building2, Loader2, UserPlus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { AuthAlert } from './components/AuthAlert'
import { AuthCard } from './components/AuthCard'
import { AuthFooterLink } from './components/AuthFooterLink'
import { AuthHeader } from './components/AuthHeader'
import { AuthInput } from './components/AuthInput'
import { AuthLayout } from './components/AuthLayout'
import { AuthPasswordField } from './components/AuthPasswordField'
import { useRegisterViewModel } from './RegisterPage.viewmodel'

export function RegisterPage() {
  const { form, onSubmit, isLoading, error } = useRegisterViewModel()
  const {
    register,
    formState: { errors },
  } = form

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          icon={UserPlus}
          title="Create Account"
          subtitle="Set up your company workspace and start managing HR in minutes."
        />

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <AuthInput
              label="First Name"
              autoComplete="given-name"
              placeholder="John"
              icon={UserPlus}
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <AuthInput
              label="Last Name"
              autoComplete="family-name"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <AuthInput
            label="Company Name"
            autoComplete="organization"
            placeholder="Acme Inc."
            icon={Building2}
            error={errors.companyName?.message}
            {...register('companyName')}
          />

          <AuthInput
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <AuthPasswordField
            label="Password"
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

          {error && <AuthAlert>{error}</AuthAlert>}

          <Button type="submit" size="lg" className="w-full shadow-sm" disabled={isLoading}>
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <AuthFooterLink prompt="Already have an account?" linkLabel="Sign In" to="/login" />
      </AuthCard>
    </AuthLayout>
  )
}
