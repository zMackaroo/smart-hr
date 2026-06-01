import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import type { Employee } from '../../../types/employee.types'

interface DeleteEmployeeModalProps {
  employee: Employee | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteEmployeeModal({
  employee,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteEmployeeModalProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Employee"
      message={
        employee
          ? `Are you sure you want to delete ${employee.fullName}? This action cannot be undone.`
          : ''
      }
      confirmLabel="Delete"
      isLoading={isSubmitting}
      destructive
    />
  )
}
