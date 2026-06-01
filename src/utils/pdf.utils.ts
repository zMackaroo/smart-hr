import { format } from 'date-fns'
import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_LOCALE } from '../config/currency.config'

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function buildPdfFilename(prefix: string, date = new Date()): string {
  return `${prefix}-${format(date, 'yyyy-MM-dd')}.pdf`
}

export function formatPdfDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return String(value)
  return format(date, 'MMM d, yyyy')
}

export function formatPdfDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return String(value)
  return format(date, 'MMM d, yyyy h:mm a')
}

export function formatPdfCurrency(value: number): string {
  return new Intl.NumberFormat(DEFAULT_CURRENCY_LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPdfCellValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'number') return value.toLocaleString(DEFAULT_CURRENCY_LOCALE)
  return String(value)
}
