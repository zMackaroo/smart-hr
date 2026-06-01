import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/layout/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { PLAN_LABELS, STATUS_LABELS, type CompanyFormInput } from '../../types/companies.types'
import { useCompaniesPageViewModel } from './CompaniesPage.viewmodel'

const inputClass =
  'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

export function CompaniesPage() {
  const vm = useCompaniesPageViewModel()

  return (
    <>
      <PageHeader
        title="Companies"
        breadcrumbs={[{ label: 'Settings' }, { label: 'Companies' }]}
        actions={
          <Button onClick={vm.openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        }
      />

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vm.companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-secondary">
                      No companies found.
                    </td>
                  </tr>
                ) : (
                  vm.companies.map((company) => (
                    <tr
                      key={company.id}
                      className="border-b border-border/50 last:border-b-0 hover:bg-surface-alt/50"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-primary">{company.name}</td>
                      <td className="px-5 py-3 font-mono text-sm text-secondary">{company.slug}</td>
                      <td className="px-5 py-3 text-sm text-secondary">
                        {PLAN_LABELS[company.plan]}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={company.status === 'active' ? 'success' : 'default'}>
                          {STATUS_LABELS[company.status]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-sm text-secondary">
                        {company.createdAt.split('T')[0]}
                      </td>
                      <td className="px-5 py-3">
                        <Button variant="outline" size="sm" onClick={() => vm.openEdit(company)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={vm.isFormOpen}
        onClose={vm.closeForm}
        title={vm.editingCompany ? 'Edit Company' : 'Add Company'}
        footer={
          <>
            <Button variant="outline" onClick={vm.closeForm} disabled={vm.isSaving}>
              Cancel
            </Button>
            <Button onClick={vm.onSave} disabled={vm.isSaving}>
              {vm.isSaving ? 'Saving...' : vm.editingCompany ? 'Save Changes' : 'Create Company'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">Company Name</label>
            <input
              className={inputClass}
              value={vm.form.name}
              onChange={(event) => vm.updateField('name', event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">Slug</label>
            <input
              className={inputClass}
              value={vm.form.slug}
              onChange={(event) => vm.updateField('slug', event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Plan</label>
              <select
                className={inputClass}
                value={vm.form.plan}
                onChange={(event) =>
                  vm.updateField('plan', event.target.value as CompanyFormInput['plan'])
                }
              >
                {vm.planOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Status</label>
              <select
                className={inputClass}
                value={vm.form.status}
                onChange={(event) =>
                  vm.updateField('status', event.target.value as CompanyFormInput['status'])
                }
              >
                {vm.statusOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
