import { Button } from '../../../components/ui/Button'

interface DashboardErrorBannerProps {
  message: string
  onRetry: () => void
}

export function DashboardErrorBanner({ message, onRetry }: DashboardErrorBannerProps) {
  return (
    <div className="rounded-lg border border-error/20 bg-[var(--state-error-bg)] px-5 py-4">
      <p className="text-sm text-error">{message}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
