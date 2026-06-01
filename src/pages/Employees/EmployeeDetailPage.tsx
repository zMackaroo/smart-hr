import { Mail, MapPin, MoreVertical, Pencil, Phone } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/layout/PageHeader'
import { UserAvatar } from '../../components/layout/UserAvatar'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { formatDate } from '../../utils/date.utils'
import { cn } from '../../utils/cn'
import { AssetsTab } from './components/tabs/AssetsTab'
import { DocumentsTab } from './components/tabs/DocumentsTab'
import { PersonalInfoTab } from './components/tabs/PersonalInfoTab'
import { TimelineTab } from './components/tabs/TimelineTab'
import { WorkInfoTab } from './components/tabs/WorkInfoTab'
import { useEmployeeDetailPageViewModel } from './EmployeeDetailPage.viewmodel'

const TAB_LABELS: Record<string, string> = {
  personal: 'Personal Info',
  work: 'Work Info',
  documents: 'Documents',
  assets: 'Assets',
  timeline: 'Timeline',
}

export function EmployeeDetailPage() {
  const vm = useEmployeeDetailPageViewModel()

  if (!vm.canAccess) {
    return <Navigate to="/dashboard" replace />
  }

  if (vm.isLoading) {
    return (
      <>
        <PageHeader title="Employee Detail" breadcrumbs={[{ label: 'HR' }, { label: 'Employees' }, { label: 'Loading...' }]} />
        <div className="h-96 animate-pulse rounded-lg bg-surface-alt" />
      </>
    )
  }

  if (vm.error || !vm.employee) {
    return (
      <>
        <PageHeader title="Employee Detail" breadcrumbs={[{ label: 'HR' }, { label: 'Employees' }]} />
        <div className="rounded-lg border border-error/20 bg-[var(--state-error-bg)] p-6 text-sm text-error">
          {vm.error ?? 'Employee not found'}
        </div>
      </>
    )
  }

  const { employee } = vm

  return (
    <>
      <PageHeader
        title={employee.fullName}
        breadcrumbs={[
          { label: 'HR' },
          { label: 'Employees', href: '/employees' },
          { label: employee.fullName },
        ]}
      />

      <div className="mb-6 rounded-lg border border-border/70 bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <UserAvatar name={employee.fullName} avatarUrl={employee.avatarUrl} seed={employee.id} size="lg" className="h-20 w-20 text-lg" />
            <div>
              <h2 className="text-xl font-semibold text-primary">{employee.fullName}</h2>
              <p className="mt-1 text-sm text-secondary">
                {employee.designation.name} · {employee.department.name}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </span>
                {employee.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {employee.phone}
                  </span>
                )}
                {employee.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {employee.location}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-secondary">{employee.employeeId}</span>
                <StatusBadge status={employee.status} />
                <span className="text-sm text-secondary">
                  Joined: {formatDate(employee.joinDate)}
                </span>
              </div>
            </div>
          </div>
          {vm.canEdit && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <button
                type="button"
                className="rounded-md p-2 text-secondary hover:bg-surface-alt"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border/70 bg-surface shadow-card">
        <div className="flex gap-1 overflow-x-auto border-b border-border px-4">
          {vm.tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => vm.setActiveTab(tab)}
              className={cn(
                'whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
                vm.activeTab === tab
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-secondary hover:text-primary',
              )}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
        <div className="p-6">
          {vm.activeTab === 'personal' && (
            <PersonalInfoTab
              personal={employee.personal}
              canEdit={vm.canEdit}
              onSave={vm.onEditPersonal}
              isSaving={vm.isSaving}
            />
          )}
          {vm.activeTab === 'work' && (
            <WorkInfoTab
              work={employee.work}
              canEdit={vm.canEdit}
              onSave={vm.onEditWork}
              isSaving={vm.isSaving}
            />
          )}
          {vm.activeTab === 'documents' && (
            <DocumentsTab
              documents={employee.documents}
              canEdit={vm.canEdit}
              onUpload={vm.onUploadDocument}
              onDelete={vm.onDeleteDocument}
            />
          )}
          {vm.activeTab === 'assets' && <AssetsTab assets={employee.assets} />}
          {vm.activeTab === 'timeline' && <TimelineTab timeline={employee.timeline} />}
        </div>
      </div>
    </>
  )
}
