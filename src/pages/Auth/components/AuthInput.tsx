import type { InputHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/cn'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: LucideIcon
}

export function AuthInput({ label, error, icon: Icon, className, id, ...props }: AuthInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-primary">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
        )}
        <input
          id={inputId}
          className={cn(
            'h-11 w-full rounded-md border bg-surface text-sm text-primary transition-colors',
            'placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
            Icon ? 'pl-10 pr-3' : 'px-3',
            error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  )
}
