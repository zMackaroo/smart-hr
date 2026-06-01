import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/cn'

interface AuthHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  centered?: boolean
}

export function AuthHeader({ title, subtitle, icon: Icon, centered = false }: AuthHeaderProps) {
  return (
    <div className={cn(centered && 'text-center')}>
      {Icon && (
        <div
          className={cn(
            'mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--state-info-bg)]',
            centered && 'mx-auto',
          )}
        >
          <Icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
        </div>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-primary">{title}</h1>
      {subtitle && <p className="mt-2 text-sm leading-relaxed text-secondary">{subtitle}</p>}
    </div>
  )
}
