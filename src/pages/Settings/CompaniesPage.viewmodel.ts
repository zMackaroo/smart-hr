import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  COMPANIES_QUERY_KEY,
  createCompany,
  getCompanies,
  updateCompany,
} from '../../api/companies.api'
import { useNotificationStore } from '../../store/notificationStore'
import type { Company, CompanyFormInput, CompanyPlan, CompanyStatus } from '../../types/companies.types'
import { PLAN_LABELS, STATUS_LABELS } from '../../types/companies.types'
import { slugifyCompanyName } from '../../utils/company-context.utils'

export function useCompaniesPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((state) => state.addNotification)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [form, setForm] = useState<CompanyFormInput>({
    name: '',
    slug: '',
    plan: 'starter',
    status: 'active',
  })

  const { data, isLoading } = useQuery({
    queryKey: COMPANIES_QUERY_KEY,
    queryFn: getCompanies,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingCompany) {
        return updateCompany(editingCompany.id, form)
      }
      return createCompany(form)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY })
      addNotification('success', editingCompany ? 'Company updated' : 'Company created')
      closeForm()
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const openCreate = () => {
    setEditingCompany(null)
    setForm({ name: '', slug: '', plan: 'starter', status: 'active' })
    setIsFormOpen(true)
  }

  const openEdit = (company: Company) => {
    setEditingCompany(company)
    setForm({
      name: company.name,
      slug: company.slug,
      plan: company.plan,
      status: company.status,
    })
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingCompany(null)
  }

  const updateField = <K extends keyof CompanyFormInput>(key: K, value: CompanyFormInput[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'name' && !editingCompany) {
        next.slug = slugifyCompanyName(String(value))
      }
      return next
    })
  }

  return {
    companies: data?.data ?? [],
    isLoading,
    isFormOpen,
    editingCompany,
    form,
    isSaving: saveMutation.isPending,
    openCreate,
    openEdit,
    closeForm,
    onSave: () => saveMutation.mutate(),
    updateField,
    planOptions: Object.entries(PLAN_LABELS) as Array<[CompanyPlan, string]>,
    statusOptions: Object.entries(STATUS_LABELS) as Array<[CompanyStatus, string]>,
  }
}
