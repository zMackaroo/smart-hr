import { PageHeader } from '../../components/layout/PageHeader'
import { OrgChartCanvas } from './components/OrgChartTree'
import { OrgChartDetailPanel } from './components/OrgChartDetailPanel'
import { OrgChartEmptyState } from './components/OrgChartEmptyState'
import { OrgChartFilters } from './components/OrgChartFilters'
import { useOrgChartPageViewModel } from './OrgChartPage.viewmodel'

export function OrgChartPage() {
  const vm = useOrgChartPageViewModel()

  return (
    <>
      <PageHeader
        title="Org Chart"
        breadcrumbs={[{ label: 'HR' }, { label: 'Org Chart' }]}
      />

      {!vm.isAdmin && (
        <div className="mb-4 rounded-md border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-primary">
          Showing your team hierarchy
        </div>
      )}

      <OrgChartFilters
        searchQuery={vm.searchQuery}
        onSearchChange={vm.setSearchQuery}
        departmentFilter={vm.departmentFilter}
        onDepartmentChange={vm.setDepartmentFilter}
        hideTerminated={vm.hideTerminated}
        onHideTerminatedChange={vm.setHideTerminated}
        departments={vm.departments}
        onExpandAll={vm.expandAll}
        onCollapseAll={vm.collapseAll}
      />

      {vm.isLoading ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="h-[480px] animate-pulse rounded-lg bg-surface-alt" />
          <div className="h-[480px] animate-pulse rounded-lg bg-surface-alt" />
        </div>
      ) : !vm.tree || vm.tree.roots.length === 0 ? (
        <OrgChartEmptyState />
      ) : (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 overflow-hidden rounded-lg border border-border/70 bg-surface p-4 shadow-card">
            <OrgChartCanvas
              roots={vm.tree.roots}
              flatNodes={vm.flatNodes}
              selectedNodeId={vm.selectedNode?.id ?? null}
              highlightedNodeId={vm.highlightedNodeId}
              expandedNodeIds={vm.expandedNodeIds}
              onSelectNode={vm.setSelectedNode}
              onToggleExpand={vm.toggleExpand}
            />
          </div>

          <OrgChartDetailPanel
            node={vm.selectedNode}
            directReports={vm.directReports}
            onSelectNode={vm.setSelectedNode}
          />
        </div>
      )}
    </>
  )
}
