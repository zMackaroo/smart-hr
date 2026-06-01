import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createRole,
  deleteRole,
  duplicateRole,
  getRoles,
  PERMISSIONS_QUERY_KEY,
  resetRolePermissions,
  updateRolePermissions,
} from '../../api/permissions.api'
import { useNotificationStore } from '../../store/notificationStore'
import {
  clonePermissions,
  permissionsEqual,
  type CreateRoleInput,
  type PermissionAction,
  type PermissionModule,
  type Role,
  type RolePermission,
} from '../../types/permission.types'

function applyToggle(
  permissions: RolePermission[],
  module: PermissionModule,
  action: PermissionAction,
  value: boolean,
): RolePermission[] {
  return permissions.map((entry) => {
    if (entry.module !== module) return entry

    const nextActions = { ...entry.actions, [action]: value }

    if (action === 'view' && !value) {
      nextActions.create = false
      nextActions.edit = false
      nextActions.delete = false
      nextActions.approve = false
    }

    if (action !== 'view' && value) {
      nextActions.view = true
    }

    return { module, actions: nextActions }
  })
}

export function useRolesPermissionsPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [selectedRoleId, setSelectedRoleIdState] = useState('')
  const [draftPermissions, setDraftPermissions] = useState<RolePermission[]>([])
  const [pendingRoleId, setPendingRoleId] = useState('')
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const { data: roles = [], isLoading } = useQuery({
    queryKey: [...PERMISSIONS_QUERY_KEY, 'roles'],
    queryFn: getRoles,
  })

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId),
    [roles, selectedRoleId],
  )

  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleIdState(roles[0].id)
    }
  }, [roles, selectedRoleId])

  useEffect(() => {
    if (selectedRole) {
      setDraftPermissions(clonePermissions(selectedRole.permissions))
    }
  }, [selectedRole])

  const isReadOnly = selectedRole?.slug === 'super_admin'

  const isDirty = useMemo(() => {
    if (!selectedRole) return false
    return !permissionsEqual(draftPermissions, selectedRole.permissions)
  }, [draftPermissions, selectedRole])

  const invalidateRoles = () => {
    void queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEY })
  }

  const saveMutation = useMutation({
    mutationFn: (payload: { roleId: string; permissions: RolePermission[] }) =>
      updateRolePermissions(payload.roleId, { permissions: payload.permissions }),
    onSuccess: (updated) => {
      invalidateRoles()
      void queryClient.setQueryData([...PERMISSIONS_QUERY_KEY, 'roles'], (current: typeof roles) =>
        current?.map((role) => (role.id === updated.id ? updated : role)),
      )
      setDraftPermissions(clonePermissions(updated.permissions))
      addNotification('success', `${updated.name} permissions saved`)
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const resetMutation = useMutation({
    mutationFn: (roleId: string) => resetRolePermissions(roleId),
    onSuccess: (updated) => {
      invalidateRoles()
      void queryClient.setQueryData([...PERMISSIONS_QUERY_KEY, 'roles'], (current: typeof roles) =>
        current?.map((role) => (role.id === updated.id ? updated : role)),
      )
      setDraftPermissions(clonePermissions(updated.permissions))
      addNotification('success', `${updated.name} permissions reset`)
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: (created) => {
      invalidateRoles()
      setShowAddRoleModal(false)
      setSelectedRoleIdState(created.id)
      addNotification('success', `Role "${created.name}" created`)
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const duplicateMutation = useMutation({
    mutationFn: duplicateRole,
    onSuccess: (created) => {
      invalidateRoles()
      setSelectedRoleIdState(created.id)
      addNotification('success', `Role duplicated as "${created.name}"`)
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      invalidateRoles()
      setRoleToDelete(null)
      setSelectedRoleIdState(roles.find((role) => role.isSystem)?.id ?? '')
      addNotification('success', 'Role deleted')
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const selectRole = useCallback(
    (roleId: string) => {
      if (roleId === selectedRoleId) return

      if (isDirty) {
        setPendingRoleId(roleId)
        setShowDiscardDialog(true)
        return
      }

      setSelectedRoleIdState(roleId)
    },
    [isDirty, selectedRoleId],
  )

  const confirmDiscard = useCallback(() => {
    if (pendingRoleId) {
      setSelectedRoleIdState(pendingRoleId)
    }
    setPendingRoleId('')
    setShowDiscardDialog(false)
  }, [pendingRoleId])

  const cancelDiscard = useCallback(() => {
    setPendingRoleId('')
    setShowDiscardDialog(false)
  }, [])

  const onToggle = useCallback(
    (module: PermissionModule, action: PermissionAction, value: boolean) => {
      setDraftPermissions((current) => applyToggle(current, module, action, value))
    },
    [],
  )

  const onSave = useCallback(() => {
    if (!selectedRole || isReadOnly) return
    saveMutation.mutate({
      roleId: selectedRole.id,
      permissions: draftPermissions,
    })
  }, [draftPermissions, isReadOnly, saveMutation, selectedRole])

  const onResetDefaults = useCallback(() => {
    if (!selectedRole || isReadOnly) return
    resetMutation.mutate(selectedRole.id)
  }, [isReadOnly, resetMutation, selectedRole])

  const onCreateRole = useCallback(
    (data: CreateRoleInput) => {
      createMutation.mutate(data)
    },
    [createMutation],
  )

  const onDuplicateRole = useCallback(() => {
    if (!selectedRole) return
    duplicateMutation.mutate(selectedRole.id)
  }, [duplicateMutation, selectedRole])

  const onConfirmDeleteRole = useCallback(() => {
    if (!roleToDelete) return
    deleteMutation.mutate(roleToDelete.id)
  }, [deleteMutation, roleToDelete])

  return {
    roles,
    selectedRole,
    selectedRoleId,
    setSelectedRoleId: selectRole,
    isLoading,
    isSubmitting:
      saveMutation.isPending ||
      resetMutation.isPending ||
      createMutation.isPending ||
      duplicateMutation.isPending ||
      deleteMutation.isPending,
    draftPermissions,
    onToggle,
    onResetDefaults,
    onSave,
    isDirty,
    isReadOnly,
    showDiscardDialog,
    confirmDiscard,
    cancelDiscard,
    showAddRoleModal,
    openAddRoleModal: () => setShowAddRoleModal(true),
    closeAddRoleModal: () => setShowAddRoleModal(false),
    onCreateRole,
    onDuplicateRole,
    roleToDelete,
    openDeleteRoleModal: setRoleToDelete,
    closeDeleteRoleModal: () => setRoleToDelete(null),
    onConfirmDeleteRole,
  }
}
