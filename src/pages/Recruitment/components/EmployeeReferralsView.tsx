import { Plus } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/shared/EmptyState'
import { formatDate } from '../../../utils/date.utils'
import { ReferralFormModal } from './ReferralFormModal'
import { ReferralStatusBadge } from './ReferralStatusBadge'
import { useEmployeeReferralsViewModel } from './EmployeeReferralsView.viewmodel'

export function EmployeeReferralsView() {
  const vm = useEmployeeReferralsViewModel()

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={vm.openFormModal}>
          <Plus className="mr-2 h-4 w-4" />
          Submit Referral
        </Button>
      </div>

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.referrals.length === 0 ? (
        <EmptyState
          title="No referrals yet"
          description="Submit a referral for an open job position."
          action={
            <Button onClick={vm.openFormModal}>
              <Plus className="mr-2 h-4 w-4" />
              Submit Referral
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Job</th>
                <th className="px-5 py-3">Relationship</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {vm.referrals.map((referral) => (
                <tr
                  key={referral.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-primary">{referral.candidateName}</p>
                    <p className="text-xs text-secondary">{referral.candidateEmail}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-primary">{referral.job.title}</td>
                  <td className="px-5 py-3.5 text-sm text-secondary">{referral.relationship}</td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {formatDate(referral.submittedDate)}
                  </td>
                  <td className="px-5 py-3.5">
                    <ReferralStatusBadge status={referral.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ReferralFormModal
        isOpen={vm.isFormModalOpen}
        jobs={vm.openJobs}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeFormModal}
        onSubmit={vm.onSubmit}
      />
    </>
  )
}
