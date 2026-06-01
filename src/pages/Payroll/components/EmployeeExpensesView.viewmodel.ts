import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  EXPENSES_QUERY_KEY,
  cancelExpenseClaim,
  getMyExpenseClaims,
  submitExpenseClaim,
} from '../../../api/expenses.api'
import { useAuthStore } from '../../../store/authStore'
import { useNotificationStore } from '../../../store/notificationStore'
import type { ExpenseClaim, ExpenseStatus, SubmitExpenseFormInput } from '../../../types/expense.types'

export function useEmployeeExpensesViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)
  const employeeId = user?.id ?? 'usr-employee-1'

  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | ''>('')
  const [page, setPage] = useState(1)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [detailClaim, setDetailClaim] = useState<ExpenseClaim | null>(null)
  const [cancelClaim, setCancelClaim] = useState<ExpenseClaim | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: [...EXPENSES_QUERY_KEY, 'mine', employeeId, statusFilter, page],
    queryFn: () =>
      getMyExpenseClaims(employeeId, {
        status: statusFilter || undefined,
        page,
        perPage: 10,
      }),
  })

  const submitMutation = useMutation({
    mutationFn: (formData: SubmitExpenseFormInput) =>
      submitExpenseClaim(employeeId, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY })
      addNotification('success', 'Expense claim submitted successfully')
      setIsSubmitModalOpen(false)
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelExpenseClaim(id, employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY })
      addNotification('success', 'Expense claim cancelled')
      setCancelClaim(null)
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  return {
    claims: data?.data ?? [],
    isLoading,
    statusFilter,
    setStatusFilter: (value: ExpenseStatus | '') => {
      setStatusFilter(value)
      setPage(1)
    },
    page,
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    start: data?.total === 0 ? 0 : (page - 1) * (data?.perPage ?? 10) + 1,
    end: Math.min(page * (data?.perPage ?? 10), data?.total ?? 0),
    onPageChange: setPage,
    isSubmitModalOpen,
    openSubmitModal: () => setIsSubmitModalOpen(true),
    closeSubmitModal: () => setIsSubmitModalOpen(false),
    onSubmit: (formData: SubmitExpenseFormInput) => submitMutation.mutate(formData),
    isSubmitting: submitMutation.isPending,
    detailClaim,
    openDetail: (claim: ExpenseClaim) => setDetailClaim(claim),
    closeDetail: () => setDetailClaim(null),
    cancelClaim,
    openCancelModal: (claim: ExpenseClaim) => setCancelClaim(claim),
    closeCancelModal: () => setCancelClaim(null),
    onConfirmCancel: () => {
      if (cancelClaim) cancelMutation.mutate(cancelClaim.id)
    },
    isCancelling: cancelMutation.isPending,
  }
}
