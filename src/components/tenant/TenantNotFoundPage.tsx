import { Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { getPlatformRegisterUrl } from '../../utils/tenant.utils'
import { useTenant } from '../../hooks/useTenant'

export function TenantNotFoundPage() {
  const { unknownTenantSlug } = useTenant()
  const slug = unknownTenantSlug ?? 'unknown'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt">
        <Building2 className="h-7 w-7 text-secondary" strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-primary">Workspace not found</h1>
      <p className="mt-2 max-w-md text-sm text-secondary">
        We couldn&apos;t find an organization at{' '}
        <span className="font-mono font-medium text-primary">{slug}</span>. Check the URL or
        contact your administrator.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/login">
          <Button variant="outline">Go to login</Button>
        </Link>
        <a href={getPlatformRegisterUrl()}>
          <Button>Create a workspace</Button>
        </a>
      </div>
    </div>
  )
}
