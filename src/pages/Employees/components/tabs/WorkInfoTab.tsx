import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../../components/ui/Button'
import { formatDate } from '../../../../utils/date.utils'
import type { EmployeeDetail } from '../../../../types/employee.types'

interface WorkInfoTabProps {
  work: EmployeeDetail['work']
  canEdit: boolean
  onSave: (data: Partial<EmployeeDetail['work']>) => void
  isSaving: boolean
}

export function WorkInfoTab({ work, canEdit, onSave, isSaving }: WorkInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(work)

  const handleSave = () => {
    onSave(form)
    setIsEditing(false)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-primary">Work Information</h3>
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={() => {
              setForm(work)
              setIsEditing(true)
            }}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-secondary">Employee Type</dt>
            <dd className="mt-1 text-sm capitalize text-primary">{work.employeeType.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-secondary">Work Location</dt>
            <dd className="mt-1 text-sm capitalize text-primary">{work.workLocation}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-secondary">Probation End</dt>
            <dd className="mt-1 text-sm text-primary">
              {work.probationEndDate ? formatDate(work.probationEndDate) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-secondary">Shift</dt>
            <dd className="mt-1 text-sm text-primary">{work.shift ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-secondary">Reporting Manager</dt>
            <dd className="mt-1 text-sm text-primary">{work.reportingManager?.name ?? '—'}</dd>
          </div>
        </dl>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Employee Type</label>
              <select
                className="h-10 w-full rounded-md border border-border px-3 text-sm"
                value={form.employeeType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    employeeType: e.target.value as EmployeeDetail['work']['employeeType'],
                  })
                }
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Work Location</label>
              <select
                className="h-10 w-full rounded-md border border-border px-3 text-sm"
                value={form.workLocation}
                onChange={(e) =>
                  setForm({
                    ...form,
                    workLocation: e.target.value as EmployeeDetail['work']['workLocation'],
                  })
                }
              >
                <option value="office">Office</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
