import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'

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
      <Select
        label="Assignee"
        value={selectedId}
        onChange={setSelectedId}
        placeholder="Select assignee"
        options={[
          { value: '', label: 'Select assignee' },
          ...assignees.map((a) => ({ value: a.id, label: a.name })),
        ]}
      />
    </Modal>
  )
}
