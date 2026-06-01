import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-alt text-secondary',
  success: 'bg-[var(--state-success-bg)] text-success',
  warning: 'bg-[var(--state-warning-bg)] text-warning',
  error: 'bg-[var(--state-error-bg)] text-error',
  info: 'bg-[var(--state-info-bg)] text-info',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
