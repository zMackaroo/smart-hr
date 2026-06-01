import type { UseFormRegister } from 'react-hook-form'
import type { CompanySettingsFormInput } from '../../../types/company.types'

interface NotificationPreferencesSectionProps {
  register: UseFormRegister<CompanySettingsFormInput>
}

const NOTIFICATION_ITEMS = [
  {
    field: 'notificationsLeaveRequests' as const,
    label: 'Leave request notifications',
    description: 'Notify admins when employees submit leave requests.',
  },
  {
    field: 'notificationsExpenseClaims' as const,
    label: 'Expense claim notifications',
    description: 'Notify admins when new expense claims are submitted.',
  },
  {
    field: 'notificationsTicketUpdates' as const,
    label: 'Ticket update notifications',
    description: 'Notify users when support tickets are updated.',
  },
  {
    field: 'notificationsPayrollProcessed' as const,
    label: 'Payroll processed notifications',
    description: 'Notify employees when payslips are generated.',
  },
]

export function NotificationPreferencesSection({ register }: NotificationPreferencesSectionProps) {
  return (
    <section className="rounded-lg border border-border/70 bg-surface p-6 shadow-card">
      <h2 className="mb-4 text-base font-semibold text-primary">Notification Preferences</h2>
      <div className="divide-y divide-border/70">
        {NOTIFICATION_ITEMS.map((item) => (
          <label
            key={item.field}
            className="flex cursor-pointer items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-primary">{item.label}</p>
              <p className="mt-0.5 text-sm text-secondary">{item.description}</p>
            </div>
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
              {...register(item.field)}
            />
          </label>
        ))}
      </div>
    </section>
  )
}
