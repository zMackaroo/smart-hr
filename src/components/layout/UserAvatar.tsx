import { cn } from '../../utils/cn'
import { getAvatarColorClasses } from '../../utils/avatar.utils'

interface UserAvatarProps {
  name: string
  avatarUrl?: string
  /** Stable key for deterministic fallback color (e.g. user/employee id) */
  seed?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function UserAvatar({ name, avatarUrl, seed, size = 'md', className }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  const colors = getAvatarColorClasses(seed ?? name)

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold',
        colors.bg,
        colors.text,
        sizeClasses[size],
        className,
      )}
      aria-hidden={!name}
    >
      {getInitials(name)}
    </div>
  )
}
