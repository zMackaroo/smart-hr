import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getOpenJobs, getMyReferrals, submitReferral } from '../../../api/recruitment.api'
import { useAuthStore } from '../../../store/authStore'
import { useNotificationStore } from '../../../store/notificationStore'
import type { ReferralFormInput } from '../../../types/recruitment.types'

export function useEmployeeReferralsViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['recruitment-my-referrals', user?.id],
    queryFn: () => getMyReferrals(user?.id ?? ''),
    enabled: Boolean(user?.id),
  })

  const { data: openJobs = [] } = useQuery({
    queryKey: ['recruitment-open-jobs'],
    queryFn: getOpenJobs,
  })

  const submitMutation = useMutation({
    mutationFn: (data: ReferralFormInput) => submitReferral(user?.id ?? '', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recruitment-my-referrals'] })
      void queryClient.invalidateQueries({ queryKey: ['recruitment-referrals'] })
      addNotification('success', 'Referral submitted successfully')
      setIsFormModalOpen(false)
    },
    onError: (error: Error) => {
      addNotification('error', error.message)
    },
  })

  return {
    referrals,
    isLoading,
    isFormModalOpen,
    openFormModal: () => setIsFormModalOpen(true),
    closeFormModal: () => setIsFormModalOpen(false),
    openJobs,
    onSubmit: (data: ReferralFormInput) => submitMutation.mutate(data),
    isSubmitting: submitMutation.isPending,
  }
}
