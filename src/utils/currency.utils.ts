export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatStatValue(value: number, format: 'number' | 'currency' = 'number'): string {
  if (format === 'currency') {
    return formatCurrency(value)
  }
  return value.toLocaleString('en-US')
}
