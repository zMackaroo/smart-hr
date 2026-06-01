import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_LOCALE } from '../config/currency.config'

export function formatCurrency(
  value: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(DEFAULT_CURRENCY_LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatStatValue(value: number, format: 'number' | 'currency' = 'number'): string {
  if (format === 'currency') {
    return formatCurrency(value)
  }
  return value.toLocaleString(DEFAULT_CURRENCY_LOCALE)
}
