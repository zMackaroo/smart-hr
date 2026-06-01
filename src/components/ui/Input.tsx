import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-primary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-10 w-full rounded border bg-surface px-3 text-sm text-primary',
          'placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent',
          error ? 'border-error' : 'border-border',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}
