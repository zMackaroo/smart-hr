import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Loader2, LogIn, Mail } from 'lucide-react'
import { getCompanySettingsSnapshot } from '../../api/company.api'
import { Button } from '../../components/ui/Button'
import { useTenant } from '../../hooks/useTenant'
import { buildTenantLoginUrl, getPlatformRegisterUrl } from '../../utils/tenant.utils'
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
  const { isPlatform, isTenantHost, resolvedTenant } = useTenant()
  const [workspaceSlug, setWorkspaceSlug] = useState('')
  const {
    register,
    formState: { errors },
  } = form

  const tenantBranding = useMemo(() => {
    if (!isTenantHost || !resolvedTenant) return null
    const settings = getCompanySettingsSnapshot(resolvedTenant.companyId)
    return {
      name: settings.name,
      logoUrl: settings.logoUrl,
    }
  }, [isTenantHost, resolvedTenant])

  const handleFindWorkspace = (event: React.FormEvent) => {
    event.preventDefault()
    const slug = workspaceSlug.trim().toLowerCase()
    if (!slug) return
    window.location.href = buildTenantLoginUrl(slug)
  }

  return (
    <AuthLayout
      brandName={tenantBranding?.name}
      brandLogoUrl={tenantBranding?.logoUrl}
      tagline={tenantBranding ? `Welcome to ${tenantBranding.name}` : undefined}
    >
      <AuthCard>
        <AuthHeader
          icon={LogIn}
          title="Sign In"
          subtitle={
            tenantBranding
              ? `Sign in to ${tenantBranding.name}`
              : 'Welcome back. Enter your credentials to access your account.'
          }
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

        {isPlatform && (
          <form onSubmit={handleFindWorkspace} className="mt-6 border-t border-border pt-6">
            <p className="text-sm font-medium text-primary">Find your workspace</p>
            <p className="mt-1 text-xs text-secondary">
              Enter your company slug to go to your organization&apos;s login page.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={workspaceSlug}
                onChange={(event) => setWorkspaceSlug(event.target.value)}
                placeholder="acme"
                className="h-10 flex-1 rounded-md border border-border bg-surface px-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              />
              <Button type="submit" variant="outline" size="md" disabled={!workspaceSlug.trim()}>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </div>
          </form>
        )}

        {isTenantHost ? (
          <p className="mt-6 text-center text-sm text-secondary">
            Need a new workspace?{' '}
            <a
              href={getPlatformRegisterUrl()}
              className="font-semibold text-accent transition-colors hover:text-accent-dark"
            >
              Create one on SmartHR
            </a>
          </p>
        ) : (
          <AuthFooterLink prompt="Don't have an account?" linkLabel="Register" to="/register" />
        )}
      </AuthCard>
    </AuthLayout>
  )
}
