import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import {
  CURRENCY_OPTIONS,
  MONTH_OPTIONS,
  TIMEZONE_OPTIONS,
  type CompanySettingsFormInput,
} from '../../../types/company.types'

interface RegionalPreferencesSectionProps {
  register: UseFormRegister<CompanySettingsFormInput>
  errors: FieldErrors<CompanySettingsFormInput>
}

const DATE_FORMAT_OPTIONS = [
  { value: 'MDY', label: 'MM/DD/YYYY' },
  { value: 'DMY', label: 'DD/MM/YYYY' },
  { value: 'YMD', label: 'YYYY-MM-DD' },
] as const

export function RegionalPreferencesSection({
  register,
  errors,
}: RegionalPreferencesSectionProps) {
  const selectClass =
    'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

  return (
    <section className="rounded-lg border border-border/70 bg-surface p-6 shadow-card">
      <h2 className="mb-4 text-base font-semibold text-primary">Regional Preferences</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Timezone</label>
          <select className={selectClass} {...register('timezone')}>
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          {errors.timezone && <p className="mt-1 text-xs text-error">{errors.timezone.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Currency</label>
          <select className={selectClass} {...register('currency')}>
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.currency && <p className="mt-1 text-xs text-error">{errors.currency.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Date Format</label>
          <select className={selectClass} {...register('dateFormat')}>
            {DATE_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Time Format</label>
          <select className={selectClass} {...register('timeFormat')}>
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Fiscal Year Start Month</label>
          <select
            className={selectClass}
            {...register('fiscalYearStartMonth', { valueAsNumber: true })}
          >
            {MONTH_OPTIONS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
