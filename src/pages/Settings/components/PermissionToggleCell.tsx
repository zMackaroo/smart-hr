import { cn } from '../../../utils/cn'

interface PermissionToggleCellProps {
  checked: boolean
  disabled?: boolean
  notApplicable?: boolean
  onChange?: (value: boolean) => void
  ariaLabel: string
}

export function PermissionToggleCell({
  checked,
  disabled = false,
  notApplicable = false,
  onChange,
  ariaLabel,
}: PermissionToggleCellProps) {
  if (notApplicable) {
    return (
      <span className="flex h-9 items-center justify-center text-sm text-muted" aria-hidden="true">
        —
      </span>
    )
  }

  return (
    <label className="flex h-9 cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange?.(event.target.checked)}
        className={cn(
          'h-4 w-4 rounded border-border text-accent focus:ring-accent',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      />
    </label>
  )
}
