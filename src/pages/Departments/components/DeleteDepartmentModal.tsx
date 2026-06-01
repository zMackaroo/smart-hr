import { AlertTriangle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import type { Department } from '../../../types/department.types'

interface DeleteDepartmentModalProps {
  department: Department | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteDepartmentModal({
  department,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteDepartmentModalProps) {
  const hasEmployees = (department?.employeeCount ?? 0) > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Department"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting || hasEmployees}
          >
            Delete
          </Button>
        </>
      }
    >
      {department && (
        <div className="space-y-3">
          {hasEmployees ? (
            <div className="flex gap-3 rounded-md border border-warning/30 bg-warning/10 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <p className="text-sm text-primary">
                This department has {department.employeeCount} employee
                {department.employeeCount === 1 ? '' : 's'}. Reassign them before deleting.
              </p>
            </div>
          ) : (
            <p className="text-sm text-secondary">
              Are you sure you want to delete <strong>{department.name}</strong>? This action
              cannot be undone.
            </p>
          )}
        </div>
      )}
    </Modal>
  )
}
