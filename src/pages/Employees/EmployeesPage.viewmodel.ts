import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getDepartments } from '../../api/departments.api'
import { getDesignations } from '../../api/designations.api'
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from '../../api/employees.api'
import { useDebounce } from '../../hooks/useDebounce'
import { useNotificationStore } from '../../store/notificationStore'
import type { Employee, EmployeeFormInput, EmployeeStatus } from '../../types/employee.types'

export function useEmployeesPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<EmployeeStatus | ''>('')
  const [page, setPage] = useState(1)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, debouncedSearch, selectedDepartment, selectedStatus],
    queryFn: () =>
      getEmployees({
        page,
        perPage: 20,
        search: debouncedSearch || undefined,
        departmentId: selectedDepartment || undefined,
        status: selectedStatus || undefined,
      }),
  })

  const { data: departmentsData = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const { data: designationsData = [] } = useQuery({
    queryKey: ['designations'],
    queryFn: () => getDesignations(),
  })

  const departments = departmentsData.map((d) => ({ id: d.id, name: d.name }))
  const designations = designationsData.map((d) => ({
    id: d.id,
    name: d.name,
    departmentId: d.department?.id,
  }))

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: ['departments'] })
      void queryClient.invalidateQueries({ queryKey: ['designations'] })
      addNotification('success', 'Employee created successfully')
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmployeeFormInput }) => updateEmployee(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: ['departments'] })
      void queryClient.invalidateQueries({ queryKey: ['designations'] })
      addNotification('success', 'Employee updated successfully')
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: ['departments'] })
      void queryClient.invalidateQueries({ queryKey: ['designations'] })
      addNotification('success', 'Employee deleted successfully')
      closeModal()
    },
  })

  const closeModal = () => {
    setModalMode(null)
    setSelectedEmployee(null)
  }

  const openAddModal = () => {
    setSelectedEmployee(null)
    setModalMode('add')
  }

  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp)
    setModalMode('edit')
  }

  const openDeleteModal = (emp: Employee) => {
    setSelectedEmployee(emp)
    setModalMode('delete')
  }

  const onSubmitAddEdit = (formData: EmployeeFormInput) => {
    if (modalMode === 'edit' && selectedEmployee) {
      updateMutation.mutate({ id: selectedEmployee.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const onConfirmDelete = () => {
    if (selectedEmployee) {
      deleteMutation.mutate(selectedEmployee.id)
    }
  }

  const onPageChange = (nextPage: number) => setPage(nextPage)

  const handleSearchChange = (q: string) => {
    setSearchQuery(q)
    setPage(1)
  }

  const handleDepartmentChange = (id: string) => {
    setSelectedDepartment(id)
    setPage(1)
  }

  const handleStatusChange = (status: EmployeeStatus | '') => {
    setSelectedStatus(status)
    setPage(1)
  }

  const employees = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const perPage = data?.perPage ?? 20
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return {
    employees,
    isLoading,
    total,
    page,
    totalPages,
    start,
    end,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery: handleSearchChange,
    selectedDepartment,
    setSelectedDepartment: handleDepartmentChange,
    selectedStatus,
    setSelectedStatus: handleStatusChange,
    departments,
    designations,
    onPageChange,
    selectedEmployee,
    openAddModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    isAddEditModalOpen: modalMode === 'add' || modalMode === 'edit',
    isDeleteModalOpen: modalMode === 'delete',
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    onSubmitAddEdit,
    onConfirmDelete,
  }
}
