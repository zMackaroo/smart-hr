import { ChevronDown, ChevronRight } from 'lucide-react'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { Badge } from '../../../components/ui/Badge'
import { cn } from '../../../utils/cn'
import type { OrgChartNode } from '../../../types/org-chart.types'

interface OrgChartNodeCardProps {
  node: OrgChartNode
  isSelected: boolean
  isHighlighted: boolean
  isExpanded: boolean
  hasChildren: boolean
  onSelect: (node: OrgChartNode) => void
  onToggleExpand: (nodeId: string) => void
  nodeRef?: (element: HTMLDivElement | null) => void
  compact?: boolean
}

export function OrgChartNodeCard({
  node,
  isSelected,
  isHighlighted,
  isExpanded,
  hasChildren,
  onSelect,
  onToggleExpand,
  nodeRef,
  compact = false,
}: OrgChartNodeCardProps) {
  const isInactive = node.status === 'terminated' || node.status === 'inactive'
  const statusVariant =
    node.status === 'terminated'
      ? 'error'
      : node.status === 'on_leave'
        ? 'warning'
        : node.status === 'inactive'
          ? 'default'
          : 'success'

  return (
    <div
      ref={nodeRef}
      data-org-node-id={node.id}
      className={cn(
        'relative rounded-lg border bg-surface shadow-card transition-all',
        compact ? 'w-full max-w-none p-3' : 'w-52 p-4',
        isSelected && 'border-accent ring-2 ring-accent/20',
        isHighlighted && !isSelected && 'border-accent/70 ring-2 ring-accent/10',
        !isSelected && !isHighlighted && 'border-border/70',
        isInactive && 'opacity-60',
      )}
    >
      {hasChildren && !compact && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggleExpand(node.id)
          }}
          className="absolute -bottom-3 left-1/2 z-20 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface text-secondary shadow-card hover:text-primary"
          aria-label={isExpanded ? 'Collapse reports' : 'Expand reports'}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      )}

      <button type="button" onClick={() => onSelect(node)} className="w-full text-left">
        <div className="flex items-start gap-3">
          <UserAvatar name={node.name} avatarUrl={node.avatarUrl} seed={node.id} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-primary">{node.name}</p>
            <p className="truncate text-xs text-secondary">{node.designation}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="info" className="max-w-full truncate">
                {node.department}
              </Badge>
              {node.status !== 'active' && (
                <Badge variant={statusVariant}>
                  {node.status === 'on_leave'
                    ? 'On Leave'
                    : node.status === 'terminated'
                      ? 'Terminated'
                      : 'Inactive'}
                </Badge>
              )}
            </div>
            {node.directReportsCount > 0 && (
              <p className="mt-2 text-xs text-muted">
                {node.directReportsCount} direct report{node.directReportsCount === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>
      </button>
    </div>
  )
}
