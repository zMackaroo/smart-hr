import { format, parseISO } from 'date-fns'

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  const value = typeof date === 'string' ? parseISO(date) : date
  return format(value, pattern)
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

export function formatRelativeTime(date: string): string {
  const value = parseISO(date.includes('T') ? date : `${date}T12:00:00`)
  const now = new Date()
  const diffMs = now.getTime() - value.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  return formatDate(date)
}
