import { Button } from '../../../components/ui/Button'
import { Select, selectTriggerClassName } from '../../../components/ui/Select'

interface OrgChartFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  departmentFilter: string
  onDepartmentChange: (value: string) => void
  hideTerminated: boolean
  onHideTerminatedChange: (value: boolean) => void
  departments: Array<{ id: string; name: string }>
  onExpandAll: () => void
  onCollapseAll: () => void
}

export function OrgChartFilters({
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  hideTerminated,
  onHideTerminatedChange,
  departments,
  onExpandAll,
  onCollapseAll,
}: OrgChartFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search employee..."
          className={selectTriggerClassName + ' sm:col-span-2 xl:col-span-1'}
        />
        <Select
          value={departmentFilter}
          onChange={onDepartmentChange}
          options={[
            { value: '', label: 'All Departments' },
            ...departments.map((department) => ({
              value: department.id,
              label: department.name,
            })),
          ]}
          placeholder="All Departments"
        />
        <label className="flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-primary">
          <input
            type="checkbox"
            checked={hideTerminated}
            onChange={(event) => onHideTerminatedChange(event.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Hide terminated
        </label>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onExpandAll}>
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={onCollapseAll}>
          Collapse All
        </Button>
      </div>
    </div>
  )
}
