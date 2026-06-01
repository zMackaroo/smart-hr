import type { ClipboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { cn } from '../../../utils/cn'

interface TwoFactorCodeInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function TwoFactorCodeInput({ value, onChange, error }: TwoFactorCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const digits = value.padEnd(6, ' ').slice(0, 6).split('')

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const updateValue = (nextDigits: string[]) => {
    onChange(nextDigits.join('').replace(/\s/g, '').slice(0, 6))
  }

  const handleChange = (index: number, digit: string) => {
    const sanitized = digit.replace(/\D/g, '').slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = sanitized || ' '
    updateValue(nextDigits)

    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const nextDigits = pasted.padEnd(6, ' ').slice(0, 6).split('')
    updateValue(nextDigits)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div>
      <div className="flex justify-center gap-2.5 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit.trim()}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event.key)}
            onPaste={handlePaste}
            className={cn(
              'h-14 w-11 rounded-lg border bg-surface-alt text-center text-xl font-semibold text-primary transition-all sm:w-12',
              'focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/25',
              digit.trim() && !error && 'border-accent/40 bg-surface',
              error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border',
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      {error && <p className="mt-3 text-center text-xs text-error">{error}</p>}
    </div>
  )
}
