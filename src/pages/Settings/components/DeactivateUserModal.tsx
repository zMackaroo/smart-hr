import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import type { PlatformUser } from '../../../types/user.types'

interface DeactivateUserModalProps {
  isOpen: boolean
  user: PlatformUser | null
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeactivateUserModal({
  isOpen,
  user,
  isSubmitting,
  onClose,
  onConfirm,
}: DeactivateUserModalProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Deactivate user?"
      message={
        user
          ? `Are you sure you want to deactivate ${user.name}? They will no longer be able to sign in.`
          : ''
      }
      confirmLabel="Deactivate"
      destructive
      isLoading={isSubmitting}
    />
  )
}
