import { ChevronDown } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { cn } from '../../utils/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export const selectTriggerClassName =
  'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:opacity-60'

interface SelectProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: SelectOption[]
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  label?: string
  error?: string
  'aria-label'?: string
}

export function Select({
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Select…',
  searchable = true,
  disabled = false,
  className,
  id,
  name,
  label,
  error,
  'aria-label': ariaLabel,
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  const filteredOptions = useMemo(() => {
    if (!searchable || !isOpen || !query.trim()) return options
    const normalized = query.trim().toLowerCase()
    return options.filter((option) => option.label.toLowerCase().includes(normalized))
  }, [isOpen, options, query, searchable])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setHighlightedIndex(0)
    onBlur?.()
  }, [onBlur])

  const open = useCallback(() => {
    if (disabled) return
    setIsOpen(true)
    if (searchable) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [disabled, searchable])

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue)
      close()
    },
    [close, onChange],
  )

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [close, isOpen])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [query, isOpen])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }

    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        open()
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((index) => Math.min(index + 1, filteredOptions.length - 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((index) => Math.max(index - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const option = filteredOptions[highlightedIndex]
      if (option && !option.disabled) {
        handleSelect(option.value)
      }
    }
  }

  const displayValue = isOpen && searchable ? query : (selectedOption?.label ?? '')

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-primary">
          {label}
        </label>
      )}

      {name && <input type="hidden" name={name} value={value} readOnly />}

      <div className="relative">
        <input
          ref={inputRef}
          id={selectId}
          type="text"
          role="combobox"
          aria-label={ariaLabel ?? label}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${selectId}-listbox`}
          disabled={disabled}
          readOnly={!searchable || !isOpen}
          value={displayValue}
          placeholder={selectedOption ? undefined : placeholder}
          onChange={(event) => {
            if (!searchable) return
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={open}
          onKeyDown={handleKeyDown}
          className={cn(
            selectTriggerClassName,
            'cursor-pointer pr-10',
            !searchable && 'cursor-default',
            error && 'border-error focus:border-error focus:ring-error/25',
          )}
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label="Toggle options"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (isOpen) {
              close()
              inputRef.current?.blur()
              return
            }
            inputRef.current?.focus()
          }}
          className={cn(
            'absolute inset-y-0 right-0 flex w-10 items-center justify-center',
            'text-secondary transition-colors hover:text-primary',
            disabled && 'pointer-events-none opacity-60',
          )}
        >
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
            strokeWidth={2}
            aria-hidden
          />
        </button>

        {isOpen && (
          <ul
            id={`${selectId}-listbox`}
            role="listbox"
            className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-card"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">No results found</li>
            ) : (
              filteredOptions.map((option, index) => (
                <li key={`${option.value}-${option.label}`} role="option" aria-selected={option.value === value}>
                  <button
                    type="button"
                    disabled={option.disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'flex w-full px-3 py-2 text-left text-sm text-primary transition-colors',
                      'hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50',
                      option.value === value && 'font-medium text-accent',
                      index === highlightedIndex && 'bg-surface-alt',
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}
