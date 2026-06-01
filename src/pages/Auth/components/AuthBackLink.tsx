import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '../../../utils/cn'

interface AuthBackLinkProps {
  to: string
  label?: string
  className?: string
}

export function AuthBackLink({ to, label = 'Back to Login', className }: AuthBackLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-accent',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      {label}
    </Link>
  )
}
