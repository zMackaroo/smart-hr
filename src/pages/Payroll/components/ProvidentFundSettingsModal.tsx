import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { PfSettingsFormSchema, type PfSettingsFormInput } from '../../../types/payroll.types'

interface ProvidentFundSettingsModalProps {
  isOpen: boolean
  settings: { defaultEmployeeRate: number; defaultEmployerRate: number } | undefined
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: PfSettingsFormInput) => void
}

export function ProvidentFundSettingsModal({
  isOpen,
  settings,
  isSubmitting,
  onClose,
  onSubmit,
}: ProvidentFundSettingsModalProps) {
  const form = useForm<PfSettingsFormInput>({
    resolver: zodResolver(PfSettingsFormSchema),
    defaultValues: { defaultEmployeeRate: 5, defaultEmployerRate: 5 },
  })

  const { register, handleSubmit, reset, formState: { errors } } = form

  useEffect(() => {
    if (!isOpen || !settings) return
    reset(settings)
  }, [isOpen, settings, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PF Settings"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <p className="text-sm text-secondary">
          Applies to newly enrolled employees. Existing records are unchanged.
        </p>
        <Input
          label="Default Employee Contribution Rate (%)"
          type="number"
          min={0}
          max={100}
          error={errors.defaultEmployeeRate?.message}
          {...register('defaultEmployeeRate', { valueAsNumber: true })}
        />
        <Input
          label="Default Employer Contribution Rate (%)"
          type="number"
          min={0}
          max={100}
          error={errors.defaultEmployerRate?.message}
          {...register('defaultEmployerRate', { valueAsNumber: true })}
        />
      </form>
    </Modal>
  )
}
