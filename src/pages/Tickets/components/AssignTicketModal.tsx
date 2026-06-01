import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'

interface AssignTicketModalProps {
  isOpen: boolean
  isSubmitting: boolean
  assignees: Array<{ id: string; name: string }>
  currentAssigneeId?: string
  onClose: () => void
  onConfirm: (assigneeId: string) => void
}

export function AssignTicketModal({
  isOpen,
  isSubmitting,
  assignees,
  currentAssigneeId,
  onClose,
  onConfirm,
}: AssignTicketModalProps) {
  const [selectedId, setSelectedId] = useState(currentAssigneeId ?? '')

  useEffect(() => {
    if (isOpen) setSelectedId(currentAssigneeId ?? assignees[0]?.id ?? '')
  }, [isOpen, currentAssigneeId, assignees])

  const selectClass =
    'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Ticket"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selectedId)}
            disabled={isSubmitting || !selectedId}
          >
            {isSubmitting ? 'Assigning...' : 'Assign'}
          </Button>
        </>
      }
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-primary">Assignee</label>
        <select
          className={selectClass}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select assignee</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  )
}
