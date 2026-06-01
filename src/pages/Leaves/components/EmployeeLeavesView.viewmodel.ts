import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  applyLeave,
  cancelLeave,
  getLeaveTypes,
  getMyLeaveBalance,
  getMyLeaveRequests,
} from '../../../api/leaves.api'
import { useAuthStore } from '../../../store/authStore'
import { useNotificationStore } from '../../../store/notificationStore'
import type { ApplyLeaveFormInput, LeaveStatus } from '../../../types/leave.types'

export function useEmployeeLeavesViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)
  const employeeId = user?.id ?? ''

  const [statusFilter, setStatusFilter] = useState<LeaveStatus | ''>('')
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const { data: balances = [], isLoading: balancesLoading } = useQuery({
    queryKey: ['my-leave-balance', employeeId],
    queryFn: () => getMyLeaveBalance(employeeId),
    enabled: Boolean(employeeId),
  })

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ['leave-types'],
    queryFn: getLeaveTypes,
  })

  const { data: leaveRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['my-leave-requests', employeeId, statusFilter],
    queryFn: () =>
      getMyLeaveRequests(employeeId, { status: statusFilter || undefined }),
    enabled: Boolean(employeeId),
  })

  const applyMutation = useMutation({
    mutationFn: (data: ApplyLeaveFormInput) => applyLeave(employeeId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-leave-balance'] })
      void queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      addNotification('success', 'Leave request submitted')
      setIsApplyModalOpen(false)
    },
    onError: (error: Error) => {
      addNotification('error', error.message)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelLeave(id, employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-leave-balance'] })
      void queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] })
      addNotification('success', 'Leave request cancelled')
      setCancellingId(null)
    },
  })

  return {
    balances,
    leaveTypes,
    leaveRequests,
    isLoading: balancesLoading || requestsLoading,
    statusFilter,
    setStatusFilter,
    isApplyModalOpen,
    openApplyModal: () => setIsApplyModalOpen(true),
    closeApplyModal: () => setIsApplyModalOpen(false),
    onSubmitApply: (data: ApplyLeaveFormInput) => applyMutation.mutate(data),
    isSubmitting: applyMutation.isPending,
    cancellingId,
    openCancelConfirm: setCancellingId,
    closeCancelConfirm: () => setCancellingId(null),
    onConfirmCancel: () => {
      if (cancellingId) cancelMutation.mutate(cancellingId)
    },
    isCancelling: cancelMutation.isPending,
  }
}
