export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return email

  const visible = localPart.slice(0, 1)
  const masked = '*'.repeat(Math.max(localPart.length - 1, 2))
  return `${visible}${masked}@${domain}`
}
