import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  acceptReferral,
  getJobs,
  getReferrals,
  rejectReferral,
} from '../../../api/recruitment.api'
import { useAuthStore } from '../../../store/authStore'
import { useNotificationStore } from '../../../store/notificationStore'
import type { Referral, ReferralStatus } from '../../../types/recruitment.types'

export function useAdminReferralsViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | ''>('')
  const [page, setPage] = useState(1)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'accept' | 'reject'
    referral: Referral
  } | null>(null)

  const { data: jobsData } = useQuery({
    queryKey: ['recruitment-jobs-all'],
    queryFn: () => getJobs({ perPage: 100 }),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['recruitment-referrals', searchQuery, selectedJob, statusFilter, page],
    queryFn: () =>
      getReferrals({
        search: searchQuery || undefined,
        jobId: selectedJob || undefined,
        status: statusFilter || undefined,
        page,
        perPage: 20,
      }),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['recruitment-referrals'] })
    void queryClient.invalidateQueries({ queryKey: ['recruitment-candidates'] })
    void queryClient.invalidateQueries({ queryKey: ['recruitment-jobs'] })
    void queryClient.invalidateQueries({ queryKey: ['recruitment-my-referrals'] })
  }

  const reviewer = { id: user?.id ?? 'admin', name: user?.name ?? 'Admin' }

  const acceptMutation = useMutation({
    mutationFn: (id: string) => acceptReferral(id, reviewer),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Referral accepted and candidate created')
      setConfirmAction(null)
    },
    onError: (error: Error) => {
      addNotification('error', error.message)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectReferral(id, reviewer),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Referral rejected')
      setConfirmAction(null)
    },
  })

  const referrals = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const perPage = data?.perPage ?? 20
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return {
    referrals,
    isLoading,
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q)
      setPage(1)
    },
    selectedJob,
    setSelectedJob: (id: string) => {
      setSelectedJob(id)
      setPage(1)
    },
    statusFilter,
    setStatusFilter: (s: ReferralStatus | '') => {
      setStatusFilter(s)
      setPage(1)
    },
    jobs: jobsData?.data ?? [],
    page,
    totalPages,
    total,
    start,
    end,
    onPageChange: setPage,
    confirmAction,
    openAcceptConfirm: (referral: Referral) =>
      setConfirmAction({ type: 'accept', referral }),
    openRejectConfirm: (referral: Referral) =>
      setConfirmAction({ type: 'reject', referral }),
    closeConfirm: () => setConfirmAction(null),
    onConfirmAccept: () => {
      if (confirmAction?.type === 'accept') {
        acceptMutation.mutate(confirmAction.referral.id)
      }
    },
    onConfirmReject: () => {
      if (confirmAction?.type === 'reject') {
        rejectMutation.mutate(confirmAction.referral.id)
      }
    },
    isSubmitting: acceptMutation.isPending || rejectMutation.isPending,
  }
}
