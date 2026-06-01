import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from '../../api/departments.api'
import { useNotificationStore } from '../../store/notificationStore'
import type { Department, DepartmentFormInput } from '../../types/department.types'

export function useDepartmentsPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null)

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments
    const q = searchQuery.toLowerCase()
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(q) ||
        dept.description?.toLowerCase().includes(q),
    )
  }, [departments, searchQuery])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['departments'] })
    void queryClient.invalidateQueries({ queryKey: ['designations'] })
  }

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Department created successfully')
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepartmentFormInput }) =>
      updateDepartment(id, data),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Department updated successfully')
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Department deleted successfully')
      closeModal()
    },
  })

  const closeModal = () => {
    setModalMode(null)
    setSelectedDepartment(null)
  }

  const openAddModal = () => {
    setSelectedDepartment(null)
    setModalMode('add')
  }

  const openEditModal = (dept: Department) => {
    setSelectedDepartment(dept)
    setModalMode('edit')
  }

  const openDeleteModal = (dept: Department) => {
    setSelectedDepartment(dept)
    setModalMode('delete')
  }

  const onSubmit = (data: DepartmentFormInput) => {
    if (modalMode === 'edit' && selectedDepartment) {
      updateMutation.mutate({ id: selectedDepartment.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const onConfirmDelete = () => {
    if (selectedDepartment && selectedDepartment.employeeCount === 0) {
      deleteMutation.mutate(selectedDepartment.id)
    }
  }

  return {
    departments,
    isLoading,
    searchQuery,
    setSearchQuery,
    filteredDepartments,
    selectedDepartment,
    isFormModalOpen: modalMode === 'add' || modalMode === 'edit',
    isDeleteModalOpen: modalMode === 'delete',
    openAddModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    onSubmit,
    onConfirmDelete,
    isSubmitting:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}
