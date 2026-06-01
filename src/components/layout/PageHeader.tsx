import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-2 text-sm text-secondary">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span className="text-muted">/</span>}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-primary">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-primary">{title}</h2>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
