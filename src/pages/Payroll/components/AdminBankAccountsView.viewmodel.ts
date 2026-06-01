import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getDepartments } from '../../../api/departments.api'
import {
  BANK_ACCOUNTS_QUERY_KEY,
  createBankAccount,
  deactivateBankAccount,
  deleteBankAccount,
  getBankAccounts,
  getEmployeePickerForBankAccounts,
  setPrimaryBankAccount,
  updateBankAccount,
} from '../../../api/bank-accounts.api'
import { useDebounce } from '../../../hooks/useDebounce'
import { useNotificationStore } from '../../../store/notificationStore'
import type {
  BankAccount,
  BankAccountFormInput,
  BankAccountStatus,
} from '../../../types/bank-account.types'

type ModalMode = 'add' | 'edit' | 'delete' | 'setPrimary' | 'deactivate' | null

export function useAdminBankAccountsViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [searchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<BankAccountStatus | ''>('')
  const [employeeFilter, setEmployeeFilter] = useState(searchParams.get('employeeId') ?? '')
  const [page, setPage] = useState(1)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)

  useEffect(() => {
    const employeeId = searchParams.get('employeeId')
    if (employeeId) setEmployeeFilter(employeeId)
  }, [searchParams])

  const debouncedSearch = useDebounce(searchQuery, 300)
  const employees = getEmployeePickerForBankAccounts()

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const { data, isLoading } = useQuery({
    queryKey: [
      ...BANK_ACCOUNTS_QUERY_KEY,
      'admin',
      page,
      debouncedSearch,
      departmentFilter,
      statusFilter,
      employeeFilter,
    ],
    queryFn: () =>
      getBankAccounts({
        page,
        perPage: 10,
        search: debouncedSearch || undefined,
        departmentId: departmentFilter || undefined,
        status: statusFilter || undefined,
        employeeId: employeeFilter || undefined,
      }),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY })
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedAccount(null)
  }

  const createMutation = useMutation({
    mutationFn: (payload: BankAccountFormInput) => createBankAccount(payload),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Bank account added')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BankAccountFormInput }) =>
      updateBankAccount(id, data),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Bank account updated')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBankAccount,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Bank account deleted')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const setPrimaryMutation = useMutation({
    mutationFn: setPrimaryBankAccount,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Primary account updated')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateBankAccount,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Bank account deactivated')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const resetPage = () => setPage(1)

  return {
    accounts: data?.data ?? [],
    isLoading,
    searchQuery,
    setSearchQuery: (value: string) => {
      setSearchQuery(value)
      resetPage()
    },
    departmentFilter,
    setDepartmentFilter: (value: string) => {
      setDepartmentFilter(value)
      resetPage()
    },
    statusFilter,
    setStatusFilter: (value: BankAccountStatus | '') => {
      setStatusFilter(value)
      resetPage()
    },
    employeeFilter,
    departments,
    employees,
    page,
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    start: data?.total === 0 ? 0 : (page - 1) * (data?.perPage ?? 10) + 1,
    end: Math.min(page * (data?.perPage ?? 10), data?.total ?? 0),
    onPageChange: setPage,
    selectedAccount,
    modalMode,
    isFormModalOpen: modalMode === 'add' || modalMode === 'edit',
    isDeleteModalOpen: modalMode === 'delete',
    isSetPrimaryModalOpen: modalMode === 'setPrimary',
    openAddModal: () => {
      setSelectedAccount(null)
      setModalMode('add')
    },
    openEditModal: (account: BankAccount) => {
      setSelectedAccount(account)
      setModalMode('edit')
    },
    openDeleteModal: (account: BankAccount) => {
      setSelectedAccount(account)
      setModalMode('delete')
    },
    openSetPrimaryModal: (account: BankAccount) => {
      setSelectedAccount(account)
      setModalMode('setPrimary')
    },
    openDeactivateModal: (account: BankAccount) => {
      setSelectedAccount(account)
      setModalMode('deactivate')
    },
    closeModal,
    onSubmit: (formData: BankAccountFormInput) => {
      if (selectedAccount) {
        updateMutation.mutate({ id: selectedAccount.id, data: formData })
      } else {
        createMutation.mutate(formData)
      }
    },
    onDelete: () => {
      if (selectedAccount) deleteMutation.mutate(selectedAccount.id)
    },
    onSetPrimary: () => {
      if (selectedAccount) setPrimaryMutation.mutate(selectedAccount.id)
    },
    onDeactivate: () => {
      if (selectedAccount) deactivateMutation.mutate(selectedAccount.id)
    },
    isSubmitting:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      setPrimaryMutation.isPending ||
      deactivateMutation.isPending,
  }
}
