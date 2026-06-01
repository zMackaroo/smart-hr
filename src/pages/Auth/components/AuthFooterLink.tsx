import { Link } from 'react-router-dom'

interface AuthFooterLinkProps {
  prompt: string
  linkLabel: string
  to: string
}

export function AuthFooterLink({ prompt, linkLabel, to }: AuthFooterLinkProps) {
  return (
    <p className="mt-6 border-t border-border pt-6 text-center text-sm text-secondary">
      {prompt}{' '}
      <Link to={to} className="font-semibold text-accent transition-colors hover:text-accent-dark">
        {linkLabel}
      </Link>
    </p>
  )
}
