import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEmployeePickerOptions } from '../../api/employees.api'
import {
  createTask,
  deleteTask,
  getProject,
  getProjectOptions,
  getTasks,
  PROJECTS_QUERY_KEY,
  TASKS_QUERY_KEY,
  updateTask,
} from '../../api/projects.api'
import { usePermission } from '../../hooks/usePermission'
import { useNotificationStore } from '../../store/notificationStore'
import type { Task, TaskFormInput } from '../../types/project.types'

export function useProjectDetailPageViewModel() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const { isAdmin } = usePermission()

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null)

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, id],
    queryFn: () => getProject(id),
    enabled: Boolean(id),
  })

  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: [...TASKS_QUERY_KEY, 'project', id],
    queryFn: () => getTasks({ projectId: id, perPage: 100, page: 1 }),
    enabled: Boolean(id),
  })

  const employees = getEmployeePickerOptions()
  const projects = getProjectOptions()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY })
  }

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Task created')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<TaskFormInput> }) =>
      updateTask(taskId, data),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Task updated')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Task deleted')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const closeModal = () => {
    setModalMode(null)
    setSelectedTask(null)
  }

  const openAddModal = () => {
    setSelectedTask(null)
    setModalMode('add')
  }

  const openEditModal = (task: Task) => {
    setSelectedTask(task)
    setModalMode('edit')
  }

  const openDeleteModal = (task: Task) => {
    setSelectedTask(task)
    setModalMode('delete')
  }

  const onSubmit = (data: TaskFormInput) => {
    if (modalMode === 'edit' && selectedTask) {
      updateMutation.mutate({ taskId: selectedTask.id, data })
      return
    }
    createMutation.mutate({ ...data, projectId: id })
  }

  const onConfirmDelete = () => {
    if (selectedTask) {
      deleteMutation.mutate(selectedTask.id)
    }
  }

  return {
    project,
    tasks: tasksData?.data ?? [],
    isLoading: isLoadingProject || isLoadingTasks,
    isAdmin,
    navigate,
    employees,
    projects,
    selectedTask,
    modalMode,
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
