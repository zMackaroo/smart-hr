import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '../store/authStore'

interface PublicAuthRouteProps {
  children: ReactNode
}

export function PublicAuthRoute({ children }: PublicAuthRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
