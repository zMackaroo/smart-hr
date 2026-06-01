import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '../../types/auth.types'
import { cn } from '../../utils/cn'
import { UserAvatar } from './UserAvatar'

interface UserDropdownProps {
  user: AuthUser
  showSettings: boolean
  onLogout: () => void
}

export function UserDropdown({ user, showSettings, onLogout }: UserDropdownProps) {
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
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-surface-alt"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
        <span className="hidden max-w-[8rem] truncate text-sm font-medium text-primary sm:block">
          {user.name}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-secondary transition-transform', isOpen && 'rotate-180')}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-border bg-surface py-1 shadow-card"
        >
          <Link
            to={`/employees/${user.id}`}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-surface-alt"
          >
            <User className="h-4 w-4 text-secondary" strokeWidth={1.5} />
            My Profile
          </Link>
          {showSettings && (
            <Link
              to="/settings/company"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-surface-alt"
            >
              <Settings className="h-4 w-4 text-secondary" strokeWidth={1.5} />
              Settings
            </Link>
          )}
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false)
              onLogout()
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-error hover:bg-surface-alt"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
