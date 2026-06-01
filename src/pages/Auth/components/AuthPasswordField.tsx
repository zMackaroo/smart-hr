import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '../../../utils/cn'

interface AuthPasswordFieldProps {
  label: string
  registration: UseFormRegisterReturn
  error?: FieldError
  autoComplete?: string
}

export function AuthPasswordField({
  label,
  registration,
  error,
  autoComplete = 'current-password',
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const inputId = registration.name

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-primary">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          strokeWidth={1.5}
        />
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className={cn(
            'h-11 w-full rounded-md border bg-surface pl-10 pr-11 text-sm text-primary transition-colors',
            'placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
            error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border',
          )}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error?.message && <p className="mt-1.5 text-xs text-error">{error.message}</p>}
    </div>
  )
}
