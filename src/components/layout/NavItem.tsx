import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

interface NavItemProps {
  icon: LucideIcon
  label: string
  href: string
  collapsed: boolean
}

export function NavItem({ icon: Icon, label, href, collapsed }: NavItemProps) {
  return (
    <NavLink
      to={href}
      end={href === '/dashboard'}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center rounded-lg text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
          isActive
            ? 'bg-sidebar-active-bg text-sidebar-active'
            : 'text-sidebar-text hover:bg-white/10 hover:text-sidebar-active',
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md bg-navy px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
          {label}
        </span>
      )}
    </NavLink>
  )
}
