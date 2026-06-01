import { Building2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { COMPANIES_QUERY_KEY, getCompanies } from '../../api/companies.api'
import { useUIStore } from '../../store/uiStore'
import { Dropdown } from '../ui/Dropdown'

export function CompanySwitcher() {
  const queryClient = useQueryClient()
  const activeCompanyId = useUIStore((state) => state.activeCompanyId)
  const setActiveCompanyId = useUIStore((state) => state.setActiveCompanyId)

  const { data } = useQuery({
    queryKey: COMPANIES_QUERY_KEY,
    queryFn: getCompanies,
  })

  const companies = data?.data ?? []
  const activeCompany = companies.find((company) => company.id === activeCompanyId)

  const onSwitch = (companyId: string) => {
    setActiveCompanyId(companyId)
    void queryClient.invalidateQueries()
  }

  return (
    <Dropdown
      align="right"
      trigger={
        <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-primary">
          <Building2 className="h-4 w-4 text-accent" strokeWidth={1.5} />
          <span className="max-w-[140px] truncate">{activeCompany?.name ?? 'Select company'}</span>
        </span>
      }
      items={companies.map((company) => ({
        label: company.id === activeCompanyId ? `${company.name} ✓` : company.name,
        onClick: () => onSwitch(company.id),
      }))}
    />
  )
}
