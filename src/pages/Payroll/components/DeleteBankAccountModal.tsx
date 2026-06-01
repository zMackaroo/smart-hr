import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import type { BankAccount } from '../../../types/bank-account.types'
import { ACCOUNT_TYPE_LABELS } from '../../../types/bank-account.types'

interface DeleteBankAccountModalProps {
  account: BankAccount | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteBankAccountModal({
  account,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteBankAccountModalProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete bank account?"
      message={
        account
          ? `Delete ${account.bankName} ${ACCOUNT_TYPE_LABELS[account.accountType]} account ${account.accountNumberMasked} for ${account.employee.name}?`
          : ''
      }
      confirmLabel="Delete"
      destructive
      isLoading={isSubmitting}
    />
  )
}
