import { Link } from 'react-router-dom'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { Badge } from '../../../components/ui/Badge'
import type { OrgChartNode } from '../../../types/org-chart.types'

interface OrgChartDetailPanelProps {
  node: OrgChartNode | null
  directReports: OrgChartNode[]
  onSelectNode: (nodeId: string) => void
}

export function OrgChartDetailPanel({
  node,
  directReports,
  onSelectNode,
}: OrgChartDetailPanelProps) {
  if (!node) {
    return (
      <aside className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
        <p className="text-sm text-secondary">Select an employee to view details.</p>
      </aside>
    )
  }

  return (
    <aside className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <div className="flex items-start gap-4">
        <UserAvatar name={node.name} avatarUrl={node.avatarUrl} seed={node.id} size="lg" />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-primary">{node.name}</h3>
          <p className="text-sm text-secondary">{node.employeeId}</p>
          <p className="mt-1 text-sm text-primary">{node.designation}</p>
          <Badge variant="info" className="mt-2">
            {node.department}
          </Badge>
        </div>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <div>
          <dt className="text-secondary">Status</dt>
          <dd className="font-medium capitalize text-primary">{node.status.replace('_', ' ')}</dd>
        </div>
        <div>
          <dt className="text-secondary">Manager</dt>
          <dd className="text-primary">
            {node.managerId && node.managerName ? (
              <button
                type="button"
                className="font-medium text-accent hover:underline"
                onClick={() => onSelectNode(node.managerId!)}
              >
                {node.managerName}
              </button>
            ) : (
              'None'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-secondary">Direct Reports</dt>
          <dd className="text-primary">{node.directReportsCount}</dd>
        </div>
      </dl>

      {directReports.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">
            Direct Reports
          </h4>
          <ul className="space-y-2">
            {directReports.map((report) => (
              <li key={report.id}>
                <button
                  type="button"
                  onClick={() => onSelectNode(report.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-surface-alt"
                >
                  <UserAvatar name={report.name} avatarUrl={report.avatarUrl} seed={report.id} size="sm" />
                  <span className="truncate text-sm text-primary">{report.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to={`/employees/${node.id}`}
        className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
      >
        View Profile
      </Link>
    </aside>
  )
}
