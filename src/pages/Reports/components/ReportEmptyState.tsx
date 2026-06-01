import { FileSearch } from 'lucide-react'
import { EmptyState } from '../../../components/shared/EmptyState'

export function ReportEmptyState() {
  return (
    <EmptyState
      title="No data found"
      description="No records match the selected filters. Try adjusting your filter criteria."
      icon={FileSearch}
    />
  )
}
