import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { usePermission } from '../../hooks/usePermission'
import { Button } from '../ui/Button'
import type { PermissionAction, PermissionModule } from '../../types/permission.types'

interface PermissionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  module: PermissionModule
  action: PermissionAction
  children: ReactNode
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  hideWhenDenied?: boolean
  deniedTitle?: string
}

export function PermissionButton({
  module,
  action,
  children,
  hideWhenDenied = false,
  deniedTitle = "You don't have permission",
  disabled,
  title,
  ...props
}: PermissionButtonProps) {
  const { canModule, isSuperAdmin } = usePermission()
  const allowed = isSuperAdmin || canModule(module, action)

  if (!allowed && hideWhenDenied) {
    return null
  }

  return (
    <Button
      {...props}
      disabled={disabled || !allowed}
      title={!allowed ? deniedTitle : title}
    >
      {children}
    </Button>
  )
}
