import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getEmployeePickerOptions } from '../../api/employees.api'
import {
  createProject,
  deleteProject,
  getProjects,
  PROJECTS_QUERY_KEY,
  updateProject,
} from '../../api/projects.api'
import { usePermission } from '../../hooks/usePermission'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import type { Project, ProjectFormInput, ProjectStatus } from '../../types/project.types'

export function useProjectsPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)
  const { isAdmin } = usePermission()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('')
  const [page, setPage] = useState(1)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, searchQuery, statusFilter, page, user?.id, isAdmin],
    queryFn: () =>
      getProjects({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        memberId: isAdmin ? undefined : user?.id,
        page,
        perPage: 12,
      }),
  })

  const employees = getEmployeePickerOptions()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Project created')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectFormInput }) => updateProject(id, data),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Project updated')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Project deleted')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const closeModal = () => {
    setModalMode(null)
    setSelectedProject(null)
  }

  const openAddModal = () => {
    setSelectedProject(null)
    setModalMode('add')
  }

  const openEditModal = (project: Project) => {
    setSelectedProject(project)
    setModalMode('edit')
  }

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project)
    setModalMode('delete')
  }

  const onSubmit = (data: ProjectFormInput) => {
    if (modalMode === 'edit' && selectedProject) {
      updateMutation.mutate({ id: selectedProject.id, data })
      return
    }
    createMutation.mutate(data)
  }

  const onConfirmDelete = () => {
    if (selectedProject) {
      deleteMutation.mutate(selectedProject.id)
    }
  }

  const projects = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const perPage = data?.perPage ?? 12
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return {
    isAdmin,
    projects,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    page,
    totalPages,
    total,
    start,
    end,
    onPageChange: setPage,
    selectedProject,
    modalMode,
    openAddModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    onSubmit,
    onConfirmDelete,
    isSubmitting:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    employees,
  }
}
