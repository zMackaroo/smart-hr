import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getDepartments } from '../../api/departments.api'
import {
  getPfSettings,
  getProvidentFundRecords,
  togglePfRecordStatus,
  updatePfSettings,
} from '../../api/payroll.api'
import { useDebounce } from '../../hooks/useDebounce'
import { useNotificationStore } from '../../store/notificationStore'
import type { PfContributionStatus, PfSettingsFormInput } from '../../types/payroll.types'

export function useProvidentFundPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<PfContributionStatus | ''>('')
  const [page, setPage] = useState(1)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [confirmToggleId, setConfirmToggleId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const { data: pfSettings } = useQuery({
    queryKey: ['pf-settings'],
    queryFn: getPfSettings,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['provident-fund', debouncedSearch, selectedDepartment, selectedStatus, page],
    queryFn: () =>
      getProvidentFundRecords({
        search: debouncedSearch || undefined,
        departmentId: selectedDepartment || undefined,
        status: selectedStatus || undefined,
        page,
        perPage: 20,
      }),
  })

  const settingsMutation = useMutation({
    mutationFn: updatePfSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pf-settings'] })
      addNotification('success', 'PF settings updated')
      setIsSettingsModalOpen(false)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: togglePfRecordStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provident-fund'] })
      addNotification('success', 'PF status updated')
      setTogglingId(null)
    },
  })

  return {
    records: data?.data ?? [],
    summary: data?.summary,
    isLoading,
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q)
      setPage(1)
    },
    selectedDepartment,
    setSelectedDepartment: (id: string) => {
      setSelectedDepartment(id)
      setPage(1)
    },
    selectedStatus,
    setSelectedStatus: (s: PfContributionStatus | '') => {
      setSelectedStatus(s)
      setPage(1)
    },
    departments,
    page,
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    onPageChange: setPage,
    isSettingsModalOpen,
    openSettingsModal: () => setIsSettingsModalOpen(true),
    closeSettingsModal: () => setIsSettingsModalOpen(false),
    pfSettings,
    onSaveSettings: (formData: PfSettingsFormInput) => settingsMutation.mutate(formData),
    onToggleStatus: (id: string) => setConfirmToggleId(id),
    confirmToggleId,
    closeToggleConfirm: () => setConfirmToggleId(null),
    onConfirmToggle: () => {
      if (confirmToggleId) {
        setTogglingId(confirmToggleId)
        toggleMutation.mutate(confirmToggleId)
        setConfirmToggleId(null)
      }
    },
    togglingId,
    isSubmitting: settingsMutation.isPending || toggleMutation.isPending,
  }
}
