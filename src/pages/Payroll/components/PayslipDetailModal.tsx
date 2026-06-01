import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import type { Payslip } from '../../../types/payroll.types'
import { PayslipPreview } from './PayslipPreview'

interface PayslipDetailModalProps {
  payslip: Payslip | null
  isOpen: boolean
  isAdmin: boolean
  isSubmitting: boolean
  onClose: () => void
  onDownload: (id: string) => void
  onMarkPaid?: (id: string) => void
}

export function PayslipDetailModal({
  payslip,
  isOpen,
  isAdmin,
  isSubmitting,
  onClose,
  onDownload,
  onMarkPaid,
}: PayslipDetailModalProps) {
  if (!payslip) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payslip Details"
      className="max-w-3xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onDownload(payslip.id)}>
            Download
          </Button>
          {isAdmin && payslip.status === 'processed' && onMarkPaid && (
            <Button onClick={() => onMarkPaid(payslip.id)} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Mark as Paid'}
            </Button>
          )}
        </>
      }
    >
      <PayslipPreview payslip={payslip} />
    </Modal>
  )
}
