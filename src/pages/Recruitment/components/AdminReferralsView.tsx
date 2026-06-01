import { Check, Search, X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { EmptyState } from '../../../components/shared/EmptyState'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { formatDate } from '../../../utils/date.utils'
import { EmployeePagination } from '../../Employees/components/EmployeePagination'
import { ReferralStatusBadge } from './ReferralStatusBadge'
import { useAdminReferralsViewModel } from './AdminReferralsView.viewmodel'
import type { ReferralStatus } from '../../../types/recruitment.types'

const STATUS_TABS: Array<{ label: string; value: ReferralStatus | '' }> = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
]

export function AdminReferralsView() {
  const vm = useAdminReferralsViewModel()

  const selectClass =
    'h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={vm.searchQuery}
            onChange={(e) => vm.setSearchQuery(e.target.value)}
            placeholder="Search candidate or referrer..."
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>

        <select
          value={vm.selectedJob}
          onChange={(e) => vm.setSelectedJob(e.target.value)}
          className={selectClass}
        >
          <option value="">All Jobs</option>
          {vm.jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => vm.setStatusFilter(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              vm.statusFilter === tab.value
                ? 'bg-accent text-white'
                : 'bg-surface-alt text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.referrals.length === 0 ? (
        <EmptyState
          title="No referrals found"
          description="Employee referrals will appear here when submitted."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <th className="px-5 py-3">Referrer</th>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Job</th>
                  <th className="px-5 py-3">Relationship</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vm.referrals.map((referral) => (
                  <tr
                    key={referral.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={referral.referrer.name}
                          avatarUrl={referral.referrer.avatarUrl}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-primary">
                            {referral.referrer.name}
                          </p>
                          <p className="text-xs text-secondary">{referral.referrer.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-primary">{referral.candidateName}</td>
                    <td className="px-5 py-3.5 text-sm text-secondary">{referral.candidateEmail}</td>
                    <td className="px-5 py-3.5 text-sm text-primary">{referral.job.title}</td>
                    <td className="px-5 py-3.5 text-sm text-secondary">{referral.relationship}</td>
                    <td className="px-5 py-3.5 text-sm text-secondary">
                      {formatDate(referral.submittedDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <ReferralStatusBadge status={referral.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {(referral.status === 'pending' || referral.status === 'reviewed') && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => vm.openAcceptConfirm(referral)}
                            className="rounded-md p-2 text-success transition-colors hover:bg-[var(--state-success-bg)]"
                            aria-label="Accept referral"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => vm.openRejectConfirm(referral)}
                            className="rounded-md p-2 text-error transition-colors hover:bg-[var(--state-error-bg)]"
                            aria-label="Reject referral"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <EmployeePagination
            page={vm.page}
            totalPages={vm.totalPages}
            start={vm.start}
            end={vm.end}
            total={vm.total}
            onPageChange={vm.onPageChange}
          />
        </>
      )}

      <Modal
        isOpen={Boolean(vm.confirmAction)}
        onClose={vm.closeConfirm}
        title={vm.confirmAction?.type === 'accept' ? 'Accept Referral' : 'Reject Referral'}
        footer={
          <>
            <Button variant="outline" onClick={vm.closeConfirm} disabled={vm.isSubmitting}>
              Cancel
            </Button>
            <Button
              variant={vm.confirmAction?.type === 'accept' ? 'primary' : 'destructive'}
              onClick={
                vm.confirmAction?.type === 'accept' ? vm.onConfirmAccept : vm.onConfirmReject
              }
              disabled={vm.isSubmitting}
            >
              {vm.isSubmitting
                ? 'Processing...'
                : vm.confirmAction?.type === 'accept'
                  ? 'Accept'
                  : 'Reject'}
            </Button>
          </>
        }
      >
        {vm.confirmAction && (
          <p className="text-sm text-secondary">
            {vm.confirmAction.type === 'accept' ? (
              <>
                Accept referral for <strong>{vm.confirmAction.referral.candidateName}</strong> for
                the <strong>{vm.confirmAction.referral.job.title}</strong> position? This will
                create a new candidate record.
              </>
            ) : (
              <>
                Reject referral for <strong>{vm.confirmAction.referral.candidateName}</strong>?
              </>
            )}
          </p>
        )}
      </Modal>
    </>
  )
}
