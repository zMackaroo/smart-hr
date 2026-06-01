import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface DropdownItem {
  label: string
  onClick: () => void
  destructive?: boolean
}

interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        className="inline-flex items-center gap-1"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger}
        <ChevronDown className="h-4 w-4 text-secondary" />
      </button>
      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute z-40 mt-2 min-w-[10rem] rounded-lg border border-border bg-surface py-1 shadow-card',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onClick()
                setIsOpen(false)
              }}
              className={cn(
                'block w-full px-4 py-2 text-left text-sm hover:bg-surface-alt',
                item.destructive ? 'text-error' : 'text-primary',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
