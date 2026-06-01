import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getDepartments } from '../../api/departments.api'
import {
  createEmployeeSalary,
  deleteEmployeeSalary,
  getEmployeeSalaries,
  getEmployeesWithoutSalary,
  updateEmployeeSalary,
} from '../../api/payroll.api'
import { useDebounce } from '../../hooks/useDebounce'
import { useNotificationStore } from '../../store/notificationStore'
import type { EmployeeSalary, SalaryFormInput } from '../../types/payroll.types'

export function useEmployeeSalaryPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [page, setPage] = useState(1)
  const [selectedSalary, setSelectedSalary] = useState<EmployeeSalary | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['employee-salaries', debouncedSearch, selectedDepartment, page],
    queryFn: () =>
      getEmployeeSalaries({
        search: debouncedSearch || undefined,
        departmentId: selectedDepartment || undefined,
        page,
        perPage: 20,
      }),
  })

  const availableEmployees = getEmployeesWithoutSalary().map((e) => ({
    id: e.id,
    employeeId: e.employeeId,
    fullName: e.fullName,
  }))

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['employee-salaries'] })
    void queryClient.invalidateQueries({ queryKey: ['payslips'] })
    void queryClient.invalidateQueries({ queryKey: ['provident-fund'] })
  }

  const createMutation = useMutation({
    mutationFn: createEmployeeSalary,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Salary configuration created')
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SalaryFormInput }) =>
      updateEmployeeSalary(id, data),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Salary configuration updated')
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEmployeeSalary,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Salary configuration deleted')
      closeModal()
    },
  })

  const closeModal = () => {
    setModalMode(null)
    setSelectedSalary(null)
  }

  return {
    salaries: data?.data ?? [],
    isLoading,
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q)
      setPage(1)
    },
    selectedDepartment,
    setSelectedDepartment: (id: string) => {
      setSelectedDepartment(id)
      setPage(1)
    },
    departments,
    page,
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    onPageChange: setPage,
    availableEmployees,
    selectedSalary,
    isFormModalOpen: modalMode === 'add' || modalMode === 'edit',
    isDeleteModalOpen: modalMode === 'delete',
    openAddModal: () => {
      setSelectedSalary(null)
      setModalMode('add')
    },
    openEditModal: (salary: EmployeeSalary) => {
      setSelectedSalary(salary)
      setModalMode('edit')
    },
    openDeleteModal: (salary: EmployeeSalary) => {
      setSelectedSalary(salary)
      setModalMode('delete')
    },
    closeModal,
    onSubmit: (formData: SalaryFormInput) => {
      if (modalMode === 'edit' && selectedSalary) {
        updateMutation.mutate({ id: selectedSalary.id, data: formData })
      } else {
        createMutation.mutate(formData)
      }
    },
    onConfirmDelete: () => {
      if (selectedSalary) deleteMutation.mutate(selectedSalary.id)
    },
    isSubmitting:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}
