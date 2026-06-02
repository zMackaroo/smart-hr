import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import type { CompanySettingsFormInput } from '../../../types/company.types'

interface HrDefaultsSectionProps {
  register: UseFormRegister<CompanySettingsFormInput>
  watch: UseFormWatch<CompanySettingsFormInput>
  setValue: UseFormSetValue<CompanySettingsFormInput>
  errors: FieldErrors<CompanySettingsFormInput>
}

export function HrDefaultsSection({ register, watch, setValue, errors }: HrDefaultsSectionProps) {
  return (
    <section className="rounded-lg border border-border/70 bg-surface p-6 shadow-card">
      <h2 className="mb-4 text-base font-semibold text-primary">HR Defaults</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Work Week"
          value={watch('workWeek')}
          onChange={(v) => setValue('workWeek', v as CompanySettingsFormInput['workWeek'], { shouldValidate: true })}
          searchable={false}
          options={[
            { value: 'mon_fri', label: 'Monday – Friday' },
            { value: 'mon_sat', label: 'Monday – Saturday' },
            { value: 'custom', label: 'Custom' },
          ]}
        />

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
