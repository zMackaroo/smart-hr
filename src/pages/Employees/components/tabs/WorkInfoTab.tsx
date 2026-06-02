import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../../components/ui/Button'
import { Select } from '../../../../components/ui/Select'
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
            <Select
              label="Employee Type"
              value={form.employeeType}
              onChange={(v) =>
                setForm({
                  ...form,
                  employeeType: v as EmployeeDetail['work']['employeeType'],
                })
              }
              searchable={false}
              options={[
                { value: 'full_time', label: 'Full Time' },
                { value: 'part_time', label: 'Part Time' },
                { value: 'contract', label: 'Contract' },
                { value: 'intern', label: 'Intern' },
              ]}
            />
            <Select
              label="Work Location"
              value={form.workLocation}
              onChange={(v) =>
                setForm({
                  ...form,
                  workLocation: v as EmployeeDetail['work']['workLocation'],
                })
              }
              searchable={false}
              options={[
                { value: 'office', label: 'Office' },
                { value: 'remote', label: 'Remote' },
                { value: 'hybrid', label: 'Hybrid' },
              ]}
            />
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
