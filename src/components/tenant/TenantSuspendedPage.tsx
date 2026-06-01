import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useTenant } from '../../hooks/useTenant'

export function TenantSuspendedPage() {
  const { resolvedTenant } = useTenant()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--state-warning-bg)]">
        <ShieldAlert className="h-7 w-7 text-warning" strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-primary">Workspace suspended</h1>
      <p className="mt-2 max-w-md text-sm text-secondary">
        {resolvedTenant?.name ?? 'This organization'} is currently inactive. Please contact
        SmartHR support to restore access.
      </p>
      <Link to="/login" className="mt-8 inline-block">
        <Button variant="outline">Back to login</Button>
      </Link>
    </div>
  )
}
