import { Menu, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { NotificationDropdown } from './NotificationDropdown'
import { UserDropdown } from './UserDropdown'
import { CompanySwitcher } from './CompanySwitcher'
import { useTopbarViewModel } from './Topbar.viewmodel'

export function Topbar() {
  const {
    user,
    toggleSidebar,
    breadcrumbs,
    unreadCount,
    showSettings,
    showCompanySwitcher,
    tenantBadge,
    onLogout,
  } = useTopbarViewModel()
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface px-4 sm:px-6">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <nav className="hidden min-w-0 flex-1 items-center gap-2 text-sm text-secondary md:flex">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {index > 0 && <span className="text-muted">/</span>}
              {crumb.href ? (
                <Link to={crumb.href} className="truncate hover:text-primary">
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-primary">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {tenantBadge && (
            <span className="hidden rounded-md bg-surface-alt px-2.5 py-1 text-xs font-medium text-secondary sm:inline-flex">
              {tenantBadge}
            </span>
          )}
          {showCompanySwitcher && <CompanySwitcher />}
          <div className="relative hidden sm:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              strokeWidth={1.5}
            />
            <input
              type="search"
              placeholder="Search…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="h-10 w-64 rounded-md border border-border bg-surface-alt pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/25"
            />
          </div>

          <NotificationDropdown unreadCount={unreadCount} />
          <UserDropdown user={user} showSettings={showSettings} onLogout={onLogout} />
        </div>
      </header>

      {searchFocused && (
        <div className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[1px] sm:hidden" aria-hidden />
      )}
    </>
  )
}
