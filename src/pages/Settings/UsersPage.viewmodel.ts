import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getRoles, PERMISSIONS_QUERY_KEY } from '../../api/permissions.api'
import {
  createUser,
  deactivateUser,
  getEmployeeLinkOptions,
  getUsers,
  reactivateUser,
  resendInvite,
  resetUserPassword,
  updateUser,
  USERS_QUERY_KEY,
} from '../../api/users.api'
import { useDebounce } from '../../hooks/useDebounce'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import type { PlatformUser, PlatformUserStatus, UserFormInput } from '../../types/user.types'

export function useUsersPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const currentUser = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const token = useAuthStore((s) => s.token)

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<PlatformUserStatus | ''>('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data: roles = [] } = useQuery({
    queryKey: [...PERMISSIONS_QUERY_KEY, 'roles'],
    queryFn: getRoles,
  })

  const { data, isLoading } = useQuery({
    queryKey: [...USERS_QUERY_KEY, page, debouncedSearch, roleFilter, statusFilter],
    queryFn: () =>
      getUsers({
        page,
        perPage: 10,
        search: debouncedSearch || undefined,
        roleId: roleFilter || undefined,
        status: statusFilter || undefined,
      }),
  })

  const employees = getEmployeeLinkOptions()

  const invalidateUsers = () => {
    void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEY })
  }

  const syncAuthUserIfNeeded = (updated: PlatformUser) => {
    if (!currentUser || currentUser.id !== updated.id || !token) return
    login(token, {
      ...currentUser,
      role: updated.role,
      customRoleId: updated.customRoleId,
    })
  }

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      invalidateUsers()
      addNotification('success', 'User created successfully')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormInput> }) =>
      updateUser(id, data),
    onSuccess: (updated) => {
      invalidateUsers()
      syncAuthUserIfNeeded(updated)
      addNotification('success', 'User updated successfully')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateUser(id, currentUser?.id),
    onSuccess: () => {
      invalidateUsers()
      addNotification('success', 'User deactivated')
      closeModal()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const reactivateMutation = useMutation({
    mutationFn: reactivateUser,
    onSuccess: () => {
      invalidateUsers()
      addNotification('success', 'User reactivated')
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const resendInviteMutation = useMutation({
    mutationFn: resendInvite,
    onSuccess: () => {
      invalidateUsers()
      addNotification('success', 'Invite email sent')
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: resetUserPassword,
    onSuccess: () => addNotification('success', 'Password reset email sent'),
    onError: (error: Error) => addNotification('error', error.message),
  })

  const closeModal = () => {
    setIsFormModalOpen(false)
    setIsDeactivateModalOpen(false)
    setSelectedUser(null)
  }

  const openAddModal = () => {
    setSelectedUser(null)
    setIsFormModalOpen(true)
  }

  const openEditModal = (user: PlatformUser) => {
    setSelectedUser(user)
    setIsFormModalOpen(true)
  }

  const openDeactivateModal = (user: PlatformUser) => {
    setSelectedUser(user)
    setIsDeactivateModalOpen(true)
  }

  const onSubmit = (formData: UserFormInput) => {
    if (selectedUser) {
      updateMutation.mutate({
        id: selectedUser.id,
        data: {
          name: formData.name,
          roleId: formData.roleId,
          employeeId: formData.employeeId,
        },
      })
      return
    }

    createMutation.mutate(formData)
  }

  const onConfirmDeactivate = () => {
    if (!selectedUser) return
    deactivateMutation.mutate(selectedUser.id)
  }

  const users = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const perPage = data?.perPage ?? 10
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  const setSearchQueryAndReset = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const setRoleFilterAndReset = (value: string) => {
    setRoleFilter(value)
    setPage(1)
  }

  const setStatusFilterAndReset = (value: PlatformUserStatus | '') => {
    setStatusFilter(value)
    setPage(1)
  }

  return {
    users,
    roles,
    isLoading,
    searchQuery,
    setSearchQuery: setSearchQueryAndReset,
    roleFilter,
    setRoleFilter: setRoleFilterAndReset,
    statusFilter,
    setStatusFilter: setStatusFilterAndReset,
    page,
    totalPages,
    total,
    start,
    end,
    onPageChange: setPage,
    selectedUser,
    isFormModalOpen,
    isDeactivateModalOpen,
    openAddModal,
    openEditModal,
    openDeactivateModal,
    closeModal,
    onSubmit,
    onConfirmDeactivate,
    onReactivate: (id: string) => reactivateMutation.mutate(id),
    onResendInvite: (id: string) => resendInviteMutation.mutate(id),
    onResetPassword: (id: string) => resetPasswordMutation.mutate(id),
    isSubmitting:
      createMutation.isPending ||
      updateMutation.isPending ||
      deactivateMutation.isPending,
    currentUserId: currentUser?.id,
    employees,
  }
}
