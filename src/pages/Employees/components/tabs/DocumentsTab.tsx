import { Download, Trash2, Upload } from 'lucide-react'
import { useRef, type ChangeEvent } from 'react'
import { Button } from '../../../../components/ui/Button'
import { formatDate } from '../../../../utils/date.utils'
import type { EmployeeDetail } from '../../../../types/employee.types'

interface DocumentsTabProps {
  documents: EmployeeDetail['documents']
  canEdit: boolean
  onUpload: (file: File, name: string) => void
  onDelete: (docId: string) => void
}

export function DocumentsTab({ documents, canEdit, onUpload, onDelete }: DocumentsTabProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file, file.name)
      event.target.value = ''
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-primary">Documents</h3>
        {canEdit && (
          <>
            <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </>
        )}
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-secondary">No documents uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-primary">{doc.name}</p>
                <p className="text-xs text-secondary">
                  {doc.type} · {formatDate(doc.uploadedAt)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={doc.url}
                  className="rounded-md p-2 text-secondary hover:bg-surface-alt hover:text-primary"
                  aria-label={`Download ${doc.name}`}
                >
                  <Download className="h-4 w-4" />
                </a>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onDelete(doc.id)}
                    className="rounded-md p-2 text-secondary hover:bg-surface-alt hover:text-error"
                    aria-label={`Delete ${doc.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
