import type { FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { Select } from '../../../components/ui/Select'
import {
  CURRENCY_OPTIONS,
  MONTH_OPTIONS,
  TIMEZONE_OPTIONS,
  type CompanySettingsFormInput,
} from '../../../types/company.types'

interface RegionalPreferencesSectionProps {
  watch: UseFormWatch<CompanySettingsFormInput>
  setValue: UseFormSetValue<CompanySettingsFormInput>
  errors: FieldErrors<CompanySettingsFormInput>
}

const DATE_FORMAT_OPTIONS = [
  { value: 'MDY', label: 'MM/DD/YYYY' },
  { value: 'DMY', label: 'DD/MM/YYYY' },
  { value: 'YMD', label: 'YYYY-MM-DD' },
] as const

export function RegionalPreferencesSection({
  watch,
  setValue,
  errors,
}: RegionalPreferencesSectionProps) {
  return (
    <section className="rounded-lg border border-border/70 bg-surface p-6 shadow-card">
      <h2 className="mb-4 text-base font-semibold text-primary">Regional Preferences</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Timezone"
          value={watch('timezone')}
          onChange={(v) => setValue('timezone', v, { shouldValidate: true })}
          error={errors.timezone?.message}
          options={TIMEZONE_OPTIONS.map((tz) => ({ value: tz.value, label: tz.label }))}
        />

        <Select
          label="Currency"
          value={watch('currency')}
          onChange={(v) => setValue('currency', v, { shouldValidate: true })}
          error={errors.currency?.message}
          options={CURRENCY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
        />

        <Select
          label="Date Format"
          value={watch('dateFormat')}
          onChange={(v) => setValue('dateFormat', v as CompanySettingsFormInput['dateFormat'], { shouldValidate: true })}
          searchable={false}
          options={DATE_FORMAT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        />

        <Select
          label="Time Format"
          value={watch('timeFormat')}
          onChange={(v) => setValue('timeFormat', v as CompanySettingsFormInput['timeFormat'], { shouldValidate: true })}
          searchable={false}
          options={[
            { value: '12h', label: '12-hour (AM/PM)' },
            { value: '24h', label: '24-hour' },
          ]}
        />

        <Select
          label="Fiscal Year Start Month"
          value={String(watch('fiscalYearStartMonth'))}
          onChange={(v) => setValue('fiscalYearStartMonth', Number(v), { shouldValidate: true })}
          searchable={false}
          options={MONTH_OPTIONS.map((name, index) => ({
            value: String(index + 1),
            label: name,
          }))}
        />
      </div>
    </section>
  )
}
