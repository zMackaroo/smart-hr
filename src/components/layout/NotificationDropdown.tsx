import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface NotificationDropdownProps {
  unreadCount: number
}

export function NotificationDropdown({ unreadCount }: NotificationDropdownProps) {
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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-surface py-2 shadow-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-primary">Notifications</p>
          </div>
          <p className="px-4 py-8 text-center text-sm text-secondary">No notifications yet</p>
        </div>
      )}
    </div>
  )
}
