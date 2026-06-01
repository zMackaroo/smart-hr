import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 text-center">
      <p className="text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-primary">Page not found</h1>
      <p className="mt-2 max-w-md text-secondary">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="mt-8">
        <Button>Go to Home</Button>
      </Link>
    </div>
  )
}
