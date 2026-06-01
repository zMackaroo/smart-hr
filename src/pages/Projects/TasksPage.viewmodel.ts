import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  getAssignableTasksForEmployee,
  getProjectOptions,
  getTasks,
  logTime,
  TASKS_QUERY_KEY,
  PROJECTS_QUERY_KEY,
} from '../../api/projects.api'
import { usePermission } from '../../hooks/usePermission'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import type { TaskStatus, TimeLogFormInput } from '../../types/project.types'

export function useTasksPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)
  const { isAdmin } = usePermission()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [projectFilter, setProjectFilter] = useState('')
  const [page, setPage] = useState(1)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: [...TASKS_QUERY_KEY, searchQuery, statusFilter, projectFilter, page, user?.id, isAdmin],
    queryFn: () =>
      getTasks({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        projectId: projectFilter || undefined,
        assigneeId: isAdmin ? undefined : user?.id,
        page,
        perPage: 20,
      }),
  })

  const assignableTasks = user ? getAssignableTasksForEmployee(user.id) : []
  const projects = getProjectOptions()

  const logMutation = useMutation({
    mutationFn: (payload: TimeLogFormInput) => {
      if (!user) throw new Error('Not authenticated')
      return logTime(payload, user.id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
      addNotification('success', 'Time logged successfully')
      setIsLogModalOpen(false)
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const tasks = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const perPage = data?.perPage ?? 20
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return {
    isAdmin,
    tasks,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    page,
    totalPages,
    total,
    start,
    end,
    onPageChange: setPage,
    projects,
    assignableTasks,
    isLogModalOpen,
    openLogModal: () => setIsLogModalOpen(true),
    closeLogModal: () => setIsLogModalOpen(false),
    onLogTime: (data: TimeLogFormInput) => logMutation.mutate(data),
    isSubmitting: logMutation.isPending,
  }
}
