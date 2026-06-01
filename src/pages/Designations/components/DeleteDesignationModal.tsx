import { AlertTriangle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import type { Designation } from '../../../types/designation.types'

interface DeleteDesignationModalProps {
  designation: Designation | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteDesignationModal({
  designation,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteDesignationModalProps) {
  const hasEmployees = (designation?.employeeCount ?? 0) > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Designation"
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
      {designation && (
        <div className="space-y-3">
          {hasEmployees ? (
            <div className="flex gap-3 rounded-md border border-warning/30 bg-warning/10 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <p className="text-sm text-primary">
                This designation has {designation.employeeCount} employee
                {designation.employeeCount === 1 ? '' : 's'}. Reassign them before deleting.
              </p>
            </div>
          ) : (
            <p className="text-sm text-secondary">
              Are you sure you want to delete <strong>{designation.name}</strong>? This action
              cannot be undone.
            </p>
          )}
        </div>
      )}
    </Modal>
  )
}
