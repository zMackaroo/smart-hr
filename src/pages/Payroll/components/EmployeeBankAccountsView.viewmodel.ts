import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  BANK_ACCOUNTS_QUERY_KEY,
  createBankAccount,
  getMyBankAccounts,
  setPrimaryBankAccount,
} from '../../../api/bank-accounts.api'
import { useAuthStore } from '../../../store/authStore'
import { useNotificationStore } from '../../../store/notificationStore'
import type { BankAccount, BankAccountFormInput } from '../../../types/bank-account.types'

export function useEmployeeBankAccountsViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)
  const employeeId = user?.id ?? 'usr-employee-1'

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [primaryAccount, setPrimaryAccount] = useState<BankAccount | null>(null)

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: [...BANK_ACCOUNTS_QUERY_KEY, 'mine', employeeId],
    queryFn: () => getMyBankAccounts(employeeId),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY })
  }

  const createMutation = useMutation({
    mutationFn: (formData: BankAccountFormInput) =>
      createBankAccount(formData, { createdByEmployee: true }),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Bank account submitted for verification')
      setIsFormModalOpen(false)
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const setPrimaryMutation = useMutation({
    mutationFn: setPrimaryBankAccount,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Primary account updated')
      setPrimaryAccount(null)
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  return {
    accounts,
    isLoading,
    employeeId,
    isFormModalOpen,
    openFormModal: () => setIsFormModalOpen(true),
    closeFormModal: () => setIsFormModalOpen(false),
    onSubmit: (formData: BankAccountFormInput) => {
      createMutation.mutate({ ...formData, employeeId })
    },
    onSetPrimary: (account: BankAccount) => setPrimaryAccount(account),
    confirmSetPrimary: () => {
      if (primaryAccount) setPrimaryMutation.mutate(primaryAccount.id)
    },
    cancelSetPrimary: () => setPrimaryAccount(null),
    primaryAccount,
    isSubmitting: createMutation.isPending || setPrimaryMutation.isPending,
  }
}
