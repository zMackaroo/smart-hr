import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addEmployeeDocument,
  deleteEmployeeDocument,
  getEmployee,
  updateEmployeePersonal,
  updateEmployeeWork,
} from '../../api/employees.api'
import { usePermission } from '../../hooks/usePermission'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import type { EmployeeDetail } from '../../types/employee.types'

const TABS = ['personal', 'work', 'documents', 'assets', 'timeline'] as const

export function useEmployeeDetailPageViewModel() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const { isAdmin, isEmployee } = usePermission()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [activeTab, setActiveTab] = useState<string>('personal')

  const isCurrentUser = currentUser?.id === id
  const canAccess = isAdmin || isCurrentUser

  useEffect(() => {
    if (isEmployee && id && currentUser && id !== currentUser.id) {
      navigate('/dashboard', { replace: true })
    }
  }, [isEmployee, id, currentUser, navigate])

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployee(id!),
    enabled: !!id && canAccess,
  })

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['employee', id] })

  const personalMutation = useMutation({
    mutationFn: (data: Partial<EmployeeDetail['personal']>) =>
      updateEmployeePersonal(id!, data),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Personal info updated')
    },
  })

  const workMutation = useMutation({
    mutationFn: (data: Partial<EmployeeDetail['work']>) => updateEmployeeWork(id!, data),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Work info updated')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, name }: { file: File; name: string }) =>
      addEmployeeDocument(id!, { name, type: file.type || 'File' }),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Document uploaded')
    },
  })

  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) => deleteEmployeeDocument(id!, docId),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Document deleted')
    },
  })

  const canEdit = isAdmin || isCurrentUser

  return {
    employee,
    isLoading,
    error: error instanceof Error ? error.message : null,
    activeTab,
    setActiveTab,
    tabs: TABS,
    onEditPersonal: (data: Partial<EmployeeDetail['personal']>) =>
      personalMutation.mutate(data),
    onEditWork: (data: Partial<EmployeeDetail['work']>) => workMutation.mutate(data),
    onUploadDocument: (file: File, name: string) => uploadMutation.mutate({ file, name }),
    onDeleteDocument: (docId: string) => deleteDocMutation.mutate(docId),
    isCurrentUser,
    canEdit,
    isSaving:
      personalMutation.isPending ||
      workMutation.isPending ||
      uploadMutation.isPending ||
      deleteDocMutation.isPending,
    canAccess,
  }
}
