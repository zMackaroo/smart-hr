const AVATAR_PALETTE = [
  { bg: 'bg-[var(--state-info-bg)]', text: 'text-info' },
  { bg: 'bg-[var(--state-success-bg)]', text: 'text-success' },
  { bg: 'bg-[var(--state-warning-bg)]', text: 'text-warning' },
  { bg: 'bg-[var(--state-error-bg)]', text: 'text-error' },
  { bg: 'bg-accent/15', text: 'text-accent' },
  { bg: 'bg-secondary/10', text: 'text-secondary' },
  { bg: 'bg-surface-alt', text: 'text-primary' },
] as const

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getAvatarColorClasses(seed: string): { bg: string; text: string } {
  const index = hashString(seed) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[index]
}
