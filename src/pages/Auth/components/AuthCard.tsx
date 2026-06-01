import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface AuthCardProps {
  children: ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/70 bg-surface px-6 py-8 shadow-card sm:px-8 sm:py-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
