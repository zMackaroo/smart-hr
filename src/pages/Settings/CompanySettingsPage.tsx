import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/layout/PageHeader'
import { CompanyProfileSection } from './components/CompanyProfileSection'
import { HrDefaultsSection } from './components/HrDefaultsSection'
import { NotificationPreferencesSection } from './components/NotificationPreferencesSection'
import { RegionalPreferencesSection } from './components/RegionalPreferencesSection'
import { useCompanySettingsPageViewModel } from './CompanySettingsPage.viewmodel'

export function CompanySettingsPage() {
  const vm = useCompanySettingsPageViewModel()
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = vm.form

  if (vm.isLoading) {
    return (
      <>
        <PageHeader
          title="Company Settings"
          breadcrumbs={[{ label: 'Settings' }, { label: 'Company Settings' }]}
        />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      </>
    )
  }

  if (vm.isError) {
    return (
      <>
        <PageHeader
          title="Company Settings"
          breadcrumbs={[{ label: 'Settings' }, { label: 'Company Settings' }]}
        />
        <div className="rounded-lg border border-error/20 bg-[var(--state-error-bg)] p-6">
          <p className="text-sm text-error">Failed to load company settings.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => void vm.refetch()}>
            Retry
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Company Settings"
        breadcrumbs={[{ label: 'Settings' }, { label: 'Company Settings' }]}
      />

      <form className="space-y-6" onSubmit={handleSubmit(vm.onSubmit)}>
        <CompanyProfileSection
          register={register}
          errors={errors}
          logoUrl={vm.settings?.logoUrl}
          onLogoUpload={vm.onLogoUpload}
          onLogoRemove={vm.onLogoRemove}
          isLogoSubmitting={vm.isLogoSubmitting}
        />

        <RegionalPreferencesSection register={register} errors={errors} />

        <HrDefaultsSection register={register} errors={errors} />

        <NotificationPreferencesSection register={register} />

        <div className="flex justify-end border-t border-border/70 pt-6">
          <Button type="submit" disabled={!isDirty || vm.isSubmitting}>
            {vm.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </>
  )
}
