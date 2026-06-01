import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getDepartments } from '../../../api/departments.api'
import {
  approveExpenseClaim,
  EXPENSES_QUERY_KEY,
  getExpenseClaims,
  markExpenseReimbursed,
  rejectExpenseClaim,
} from '../../../api/expenses.api'
import { useDebounce } from '../../../hooks/useDebounce'
import { useAuthStore } from '../../../store/authStore'
import { useNotificationStore } from '../../../store/notificationStore'
import type {
  ExpenseCategory,
  ExpenseClaim,
  ExpenseStatus,
} from '../../../types/expense.types'

export function useAdminExpensesViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | ''>('')
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | ''>('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const [detailClaim, setDetailClaim] = useState<ExpenseClaim | null>(null)
  const [rejectingClaim, setRejectingClaim] = useState<ExpenseClaim | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const { data, isLoading } = useQuery({
    queryKey: [
      ...EXPENSES_QUERY_KEY,
      'admin',
      page,
      debouncedSearch,
      statusFilter,
      categoryFilter,
      departmentFilter,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      getExpenseClaims({
        page,
        perPage: 10,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        departmentId: departmentFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY })
  }

  const reviewer = { id: user?.id ?? 'usr-admin-1', name: user?.name ?? 'Admin' }

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveExpenseClaim(id, reviewer),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Expense claim approved')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectExpenseClaim(id, reviewer, reason),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Expense claim rejected')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const reimburseMutation = useMutation({
    mutationFn: (id: string) => markExpenseReimbursed(id, reviewer),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Expense marked as reimbursed')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const closeModal = () => {
    setDetailClaim(null)
    setRejectingClaim(null)
  }

  const resetPage = () => setPage(1)

  return {
    claims: data?.data ?? [],
    summary: data?.summary,
    isLoading,
    searchQuery,
    setSearchQuery: (value: string) => {
      setSearchQuery(value)
      resetPage()
    },
    statusFilter,
    setStatusFilter: (value: ExpenseStatus | '') => {
      setStatusFilter(value)
      resetPage()
    },
    categoryFilter,
    setCategoryFilter: (value: ExpenseCategory | '') => {
      setCategoryFilter(value)
      resetPage()
    },
    departmentFilter,
    setDepartmentFilter: (value: string) => {
      setDepartmentFilter(value)
      resetPage()
    },
    dateFrom,
    setDateFrom: (value: string) => {
      setDateFrom(value)
      resetPage()
    },
    dateTo,
    setDateTo: (value: string) => {
      setDateTo(value)
      resetPage()
    },
    departments,
    page,
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    start: data?.total === 0 ? 0 : (page - 1) * (data?.perPage ?? 10) + 1,
    end: Math.min(page * (data?.perPage ?? 10), data?.total ?? 0),
    onPageChange: setPage,
    detailClaim,
    rejectingClaim,
    openDetail: (claim: ExpenseClaim) => setDetailClaim(claim),
    openReject: (claim: ExpenseClaim) => setRejectingClaim(claim),
    closeModal,
    onApprove: (id: string) => approveMutation.mutate(id),
    onReject: (id: string, reason: string) => rejectMutation.mutate({ id, reason }),
    onMarkReimbursed: (id: string) => reimburseMutation.mutate(id),
    isSubmitting:
      approveMutation.isPending || rejectMutation.isPending || reimburseMutation.isPending,
  }
}
