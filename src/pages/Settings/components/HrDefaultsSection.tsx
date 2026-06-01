import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '../../../components/ui/Input'
import type { CompanySettingsFormInput } from '../../../types/company.types'

interface HrDefaultsSectionProps {
  register: UseFormRegister<CompanySettingsFormInput>
  errors: FieldErrors<CompanySettingsFormInput>
}

export function HrDefaultsSection({ register, errors }: HrDefaultsSectionProps) {
  const selectClass =
    'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

  return (
    <section className="rounded-lg border border-border/70 bg-surface p-6 shadow-card">
      <h2 className="mb-4 text-base font-semibold text-primary">HR Defaults</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Work Week</label>
          <select className={selectClass} {...register('workWeek')}>
            <option value="mon_fri">Monday – Friday</option>
            <option value="mon_sat">Monday – Saturday</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <Input
          label="Standard Work Hours (per day)"
          type="number"
          min={1}
          max={24}
          error={errors.standardWorkHours?.message}
          {...register('standardWorkHours', { valueAsNumber: true })}
        />

        <Input
          label="Default Probation Period (days)"
          type="number"
          min={0}
          error={errors.defaultProbationDays?.message}
          {...register('defaultProbationDays', { valueAsNumber: true })}
        />
      </div>
    </section>
  )
}
