import { Link } from 'react-router-dom'
import { Loader2, LogIn, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { AuthAlert } from './components/AuthAlert'
import { AuthCard } from './components/AuthCard'
import { AuthFooterLink } from './components/AuthFooterLink'
import { AuthHeader } from './components/AuthHeader'
import { AuthInput } from './components/AuthInput'
import { AuthLayout } from './components/AuthLayout'
import { AuthPasswordField } from './components/AuthPasswordField'
import { useLoginViewModel } from './LoginPage.viewmodel'

export function LoginPage() {
  const { form, onSubmit, isLoading, error } = useLoginViewModel()
  const {
    register,
    formState: { errors },
  } = form

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          icon={LogIn}
          title="Sign In"
          subtitle="Welcome back. Enter your credentials to access your account."
        />

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

          <AuthPasswordField
            label="Password"
            registration={register('password')}
            error={errors.password}
          />

          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-secondary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
                {...register('rememberMe')}
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-accent transition-colors hover:text-accent-dark"
            >
              Forgot password?
            </Link>
          </div>

          {error && <AuthAlert>{error}</AuthAlert>}

          <Button type="submit" size="lg" className="w-full shadow-sm" disabled={isLoading}>
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <AuthFooterLink prompt="Don't have an account?" linkLabel="Register" to="/register" />
      </AuthCard>
    </AuthLayout>
  )
}
