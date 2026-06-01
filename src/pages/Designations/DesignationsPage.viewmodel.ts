import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { getDepartments } from '../../api/departments.api'
import {
  createDesignation,
  deleteDesignation,
  getDesignations,
  updateDesignation,
} from '../../api/designations.api'
import { useNotificationStore } from '../../store/notificationStore'
import type { Designation, DesignationFormInput } from '../../types/designation.types'

export function useDesignationsPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('')
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const { data: designations = [], isLoading } = useQuery({
    queryKey: ['designations', selectedDepartmentFilter],
    queryFn: () =>
      getDesignations({
        departmentId: selectedDepartmentFilter || undefined,
      }),
  })

  const filteredDesignations = useMemo(() => {
    if (!searchQuery.trim()) return designations
    const q = searchQuery.toLowerCase()
    return designations.filter((des) => des.name.toLowerCase().includes(q))
  }, [designations, searchQuery])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['departments'] })
    void queryClient.invalidateQueries({ queryKey: ['designations'] })
  }

  const createMutation = useMutation({
    mutationFn: createDesignation,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Designation created successfully')
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DesignationFormInput }) =>
      updateDesignation(id, data),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Designation updated successfully')
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDesignation,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Designation deleted successfully')
      closeModal()
    },
  })

  const closeModal = () => {
    setModalMode(null)
    setSelectedDesignation(null)
  }

  const openAddModal = () => {
    setSelectedDesignation(null)
    setModalMode('add')
  }

  const openEditModal = (des: Designation) => {
    setSelectedDesignation(des)
    setModalMode('edit')
  }

  const openDeleteModal = (des: Designation) => {
    setSelectedDesignation(des)
    setModalMode('delete')
  }

  const onSubmit = (data: DesignationFormInput) => {
    if (modalMode === 'edit' && selectedDesignation) {
      updateMutation.mutate({ id: selectedDesignation.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const onConfirmDelete = () => {
    if (selectedDesignation && selectedDesignation.employeeCount === 0) {
      deleteMutation.mutate(selectedDesignation.id)
    }
  }

  return {
    designations,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedDepartmentFilter,
    setSelectedDepartmentFilter,
    filteredDesignations,
    departments,
    selectedDesignation,
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
