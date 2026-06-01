import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getDepartments } from '../../../api/departments.api'
import {
  approveLeave,
  createLeaveType,
  deleteLeaveType,
  getLeaveRequests,
  getLeaveTypes,
  leaveTypeHasActiveRequests,
  rejectLeave,
  updateLeaveType,
} from '../../../api/leaves.api'
import { useAuthStore } from '../../../store/authStore'
import { useNotificationStore } from '../../../store/notificationStore'
import type {
  LeaveRequest,
  LeaveRequestListResponse,
  LeaveStatus,
  LeaveType,
  LeaveTypeFormInput,
} from '../../../types/leave.types'

export function useAdminLeavesViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)

  const now = new Date()
  const [activeTab, setActiveTab] = useState<'requests' | 'types'>('requests')
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | ''>('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<number | ''>('')
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [page, setPage] = useState(1)

  const [detailRequest, setDetailRequest] = useState<LeaveRequest | null>(null)
  const [rejectingRequest, setRejectingRequest] = useState<LeaveRequest | null>(null)
  const [approvingRequest, setApprovingRequest] = useState<LeaveRequest | null>(null)

  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null)
  const [leaveTypeModalMode, setLeaveTypeModalMode] = useState<'add' | 'edit' | 'delete' | null>(
    null,
  )

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ['leave-types'],
    queryFn: getLeaveTypes,
  })

  const { data, isLoading } = useQuery({
    queryKey: [
      'leave-requests',
      statusFilter,
      departmentFilter,
      leaveTypeFilter,
      selectedMonth,
      selectedYear,
      page,
    ],
    queryFn: () =>
      getLeaveRequests({
        status: statusFilter || undefined,
        departmentId: departmentFilter || undefined,
        leaveTypeId: leaveTypeFilter || undefined,
        month: selectedMonth || undefined,
        year: selectedMonth ? selectedYear : undefined,
        page,
        perPage: 20,
      }),
    enabled: activeTab === 'requests',
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
    void queryClient.invalidateQueries({ queryKey: ['leave-types'] })
    void queryClient.invalidateQueries({ queryKey: ['my-leave-balance'] })
    void queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] })
  }

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      approveLeave(id, { id: user?.id ?? 'admin', name: user?.name ?? 'Admin' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['leave-requests'] })
      const previous = queryClient.getQueryData([
        'leave-requests',
        statusFilter,
        departmentFilter,
        leaveTypeFilter,
        selectedMonth,
        selectedYear,
        page,
      ])
      queryClient.setQueryData(
        [
          'leave-requests',
          statusFilter,
          departmentFilter,
          leaveTypeFilter,
          selectedMonth,
          selectedYear,
          page,
        ],
        (old: LeaveRequestListResponse | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map((r) =>
              r.id === id ? { ...r, status: 'approved' as const } : r,
            ),
          }
        },
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          [
            'leave-requests',
            statusFilter,
            departmentFilter,
            leaveTypeFilter,
            selectedMonth,
            selectedYear,
            page,
          ],
          context.previous,
        )
      }
    },
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Leave request approved')
      setApprovingRequest(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectLeave(id, reason),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Leave request rejected')
      setRejectingRequest(null)
    },
  })

  const createTypeMutation = useMutation({
    mutationFn: createLeaveType,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Leave type created')
      setLeaveTypeModalMode(null)
      setSelectedLeaveType(null)
    },
  })

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeaveTypeFormInput }) =>
      updateLeaveType(id, data),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Leave type updated')
      setLeaveTypeModalMode(null)
      setSelectedLeaveType(null)
    },
  })

  const deleteTypeMutation = useMutation({
    mutationFn: deleteLeaveType,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Leave type deleted')
      setLeaveTypeModalMode(null)
      setSelectedLeaveType(null)
    },
  })

  const handleStatusFilterChange = (value: LeaveStatus | '') => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value)
    setPage(1)
  }

  const handleLeaveTypeFilterChange = (value: string) => {
    setLeaveTypeFilter(value)
    setPage(1)
  }

  return {
    activeTab,
    setActiveTab,
    leaveRequests: data?.data ?? [],
    isLoading,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    departmentFilter,
    setDepartmentFilter: handleDepartmentFilterChange,
    leaveTypeFilter,
    setLeaveTypeFilter: handleLeaveTypeFilterChange,
    selectedMonth,
    setSelectedMonth: (m: number | '') => {
      setSelectedMonth(m)
      setPage(1)
    },
    selectedYear,
    setSelectedYear: (y: number) => {
      setSelectedYear(y)
      setPage(1)
    },
    departments,
    leaveTypes,
    page,
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    onPageChange: setPage,
    detailRequest,
    openDetailModal: setDetailRequest,
    closeDetailModal: () => setDetailRequest(null),
    approvingRequest,
    openApproveModal: setApprovingRequest,
    closeApproveModal: () => setApprovingRequest(null),
    onConfirmApprove: () => {
      if (approvingRequest) approveMutation.mutate(approvingRequest.id)
    },
    isApproving: approveMutation.isPending,
    rejectingRequest,
    openRejectModal: setRejectingRequest,
    closeRejectModal: () => setRejectingRequest(null),
    onConfirmReject: (reason: string) => {
      if (rejectingRequest) rejectMutation.mutate({ id: rejectingRequest.id, reason })
    },
    isRejecting: rejectMutation.isPending,
    selectedLeaveType,
    isLeaveTypeFormOpen: leaveTypeModalMode === 'add' || leaveTypeModalMode === 'edit',
    isDeleteLeaveTypeOpen: leaveTypeModalMode === 'delete',
    openAddLeaveTypeModal: () => {
      setSelectedLeaveType(null)
      setLeaveTypeModalMode('add')
    },
    openEditLeaveTypeModal: (lt: LeaveType) => {
      setSelectedLeaveType(lt)
      setLeaveTypeModalMode('edit')
    },
    openDeleteLeaveTypeModal: (lt: LeaveType) => {
      setSelectedLeaveType(lt)
      setLeaveTypeModalMode('delete')
    },
    closeLeaveTypeModal: () => {
      setLeaveTypeModalMode(null)
      setSelectedLeaveType(null)
    },
    onSubmitLeaveType: (formData: LeaveTypeFormInput) => {
      if (leaveTypeModalMode === 'edit' && selectedLeaveType) {
        updateTypeMutation.mutate({ id: selectedLeaveType.id, data: formData })
      } else {
        createTypeMutation.mutate(formData)
      }
    },
    onConfirmDeleteLeaveType: () => {
      if (selectedLeaveType) deleteTypeMutation.mutate(selectedLeaveType.id)
    },
    canDeleteLeaveType: selectedLeaveType
      ? !leaveTypeHasActiveRequests(selectedLeaveType.id)
      : false,
    isSubmittingLeaveType:
      createTypeMutation.isPending ||
      updateTypeMutation.isPending ||
      deleteTypeMutation.isPending,
  }
}
