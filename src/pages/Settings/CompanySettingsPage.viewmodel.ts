import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  getCompanySettings,
  removeCompanyLogo,
  updateCompanySettings,
  uploadCompanyLogo,
} from '../../api/company.api'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useNotificationStore } from '../../store/notificationStore'
import {
  CompanySettingsFormSchema,
  settingsToForm,
  type CompanySettingsFormInput,
} from '../../types/company.types'
import { DEFAULT_CURRENCY } from '../../config/currency.config'

export function useCompanySettingsPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)
  const activeCompanyId = useUIStore((s) => s.activeCompanyId)

  const form = useForm<CompanySettingsFormInput>({
    resolver: zodResolver(CompanySettingsFormSchema),
    defaultValues: {
      name: '',
      legalName: '',
      email: '',
      phone: '',
      website: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      timezone: 'America/New_York',
      currency: DEFAULT_CURRENCY,
      dateFormat: 'MDY',
      timeFormat: '12h',
      fiscalYearStartMonth: 1,
      workWeek: 'mon_fri',
      standardWorkHours: 8,
      defaultProbationDays: 90,
      notificationsLeaveRequests: true,
      notificationsExpenseClaims: true,
      notificationsTicketUpdates: true,
      notificationsPayrollProcessed: true,
    },
  })

  const {
    data: settings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['company-settings', activeCompanyId],
    queryFn: () => getCompanySettings(),
  })

  useEffect(() => {
    if (settings) {
      form.reset(settingsToForm(settings))
    }
  }, [settings, form])

  const updateMutation = useMutation({
    mutationFn: (data: CompanySettingsFormInput) =>
      updateCompanySettings(data, {
        id: user?.id ?? 'usr-super-1',
        name: user?.name ?? 'Super Admin',
      }),
    onSuccess: (updated) => {
      void queryClient.setQueryData(['company-settings', activeCompanyId], updated)
      form.reset(settingsToForm(updated))
      addNotification('success', 'Company settings saved successfully')
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const logoUploadMutation = useMutation({
    mutationFn: (file: File) => uploadCompanyLogo(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['company-settings', activeCompanyId] })
      addNotification('success', 'Logo updated successfully')
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const logoRemoveMutation = useMutation({
    mutationFn: () => removeCompanyLogo(),
    onSuccess: (updated) => {
      void queryClient.setQueryData(['company-settings', activeCompanyId], updated)
      addNotification('success', 'Logo removed')
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const onSubmit = (data: CompanySettingsFormInput) => {
    updateMutation.mutate(data)
  }

  return {
    settings,
    isLoading,
    isError,
    refetch,
    isSubmitting: updateMutation.isPending,
    form,
    onSubmit,
    onLogoUpload: (file: File) => logoUploadMutation.mutate(file),
    onLogoRemove: () => logoRemoveMutation.mutate(),
    isLogoSubmitting: logoUploadMutation.isPending || logoRemoveMutation.isPending,
  }
}
