import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

type AuthAlertVariant = 'error' | 'success' | 'warning' | 'info'

interface AuthAlertProps {
  children: ReactNode
  variant?: AuthAlertVariant
  className?: string
}

const variantClasses: Record<AuthAlertVariant, string> = {
  error: 'border-error/20 bg-[var(--state-error-bg)] text-error',
  success: 'border-success/20 bg-[var(--state-success-bg)] text-primary',
  warning: 'border-warning/20 bg-[var(--state-warning-bg)] text-primary',
  info: 'border-info/20 bg-[var(--state-info-bg)] text-primary',
}

export function AuthAlert({ children, variant = 'error', className }: AuthAlertProps) {
  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 text-sm leading-relaxed',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </div>
  )
}
