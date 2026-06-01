import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { formatDate } from '../../../../utils/date.utils'
import type { EmployeeDetail } from '../../../../types/employee.types'

interface PersonalInfoTabProps {
  personal: EmployeeDetail['personal']
  canEdit: boolean
  onSave: (data: Partial<EmployeeDetail['personal']>) => void
  isSaving: boolean
}

export function PersonalInfoTab({ personal, canEdit, onSave, isSaving }: PersonalInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(personal)

  const fields = [
    { label: 'Date of Birth', key: 'dateOfBirth' as const, type: 'date' },
    { label: 'Gender', key: 'gender' as const },
    { label: 'Marital Status', key: 'maritalStatus' as const },
    { label: 'Nationality', key: 'nationality' as const },
    { label: 'Address', key: 'address' as const },
    { label: 'City', key: 'city' as const },
    { label: 'Country', key: 'country' as const },
  ]

  const handleSave = () => {
    onSave(form)
    setIsEditing(false)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-primary">Personal Information</h3>
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={() => {
              setForm(personal)
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
          {fields.map(({ label, key }) => (
            <div key={key}>
              <dt className="text-xs font-medium uppercase tracking-wide text-secondary">{label}</dt>
              <dd className="mt-1 text-sm text-primary">
                {key === 'dateOfBirth' && personal[key]
                  ? formatDate(personal[key]!)
                  : (personal[key] ?? '—')}
              </dd>
            </div>
          ))}
          {personal.emergencyContact && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-secondary">
                Emergency Contact
              </dt>
              <dd className="mt-1 text-sm text-primary">
                {personal.emergencyContact.name} ({personal.emergencyContact.relationship}) —{' '}
                {personal.emergencyContact.phone}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth ?? ''}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
            <Input
              label="Nationality"
              value={form.nationality ?? ''}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
            />
            <Input
              label="Address"
              value={form.address ?? ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <Input
              label="City"
              value={form.city ?? ''}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
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
