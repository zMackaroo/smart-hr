import { useEffect, useRef, type MutableRefObject } from 'react'
import type { OrgChartNode } from '../../../types/org-chart.types'
import { cn } from '../../../utils/cn'
import { OrgChartNodeCard } from './OrgChartNode'

interface OrgChartTreeProps {
  roots: OrgChartNode[]
  selectedNodeId: string | null
  highlightedNodeId: string | null
  expandedNodeIds: Set<string>
  onSelectNode: (node: OrgChartNode) => void
  onToggleExpand: (nodeId: string) => void
}

export function OrgChartTree({
  roots,
  selectedNodeId,
  highlightedNodeId,
  expandedNodeIds,
  onSelectNode,
  onToggleExpand,
}: OrgChartTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (!highlightedNodeId) return
    const container = containerRef.current
    const element = nodeRefs.current.get(highlightedNodeId)
    if (!container || !element) return

    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const scrollLeft =
      container.scrollLeft +
      (elementRect.left - containerRect.left) -
      containerRect.width / 2 +
      elementRect.width / 2
    const scrollTop =
      container.scrollTop +
      (elementRect.top - containerRect.top) -
      containerRect.height / 2 +
      elementRect.height / 2

    container.scrollTo({ left: scrollLeft, top: scrollTop, behavior: 'smooth' })
  }, [highlightedNodeId])

  return (
    <div
      ref={containerRef}
      className="org-chart-scroll hidden h-[min(560px,calc(100vh-16rem))] w-full min-w-0 overflow-auto md:block"
    >
      <ul className="org-tree inline-flex min-w-max justify-center gap-8 pb-8 pt-2">
        {roots.map((node) => (
          <OrgChartTreeBranch
            key={node.id}
            node={node}
            selectedNodeId={selectedNodeId}
            highlightedNodeId={highlightedNodeId}
            expandedNodeIds={expandedNodeIds}
            onSelectNode={onSelectNode}
            onToggleExpand={onToggleExpand}
            nodeRefs={nodeRefs}
          />
        ))}
      </ul>
    </div>
  )
}

function OrgChartTreeBranch({
  node,
  selectedNodeId,
  highlightedNodeId,
  expandedNodeIds,
  onSelectNode,
  onToggleExpand,
  nodeRefs,
}: {
  node: OrgChartNode
  selectedNodeId: string | null
  highlightedNodeId: string | null
  expandedNodeIds: Set<string>
  onSelectNode: (node: OrgChartNode) => void
  onToggleExpand: (nodeId: string) => void
  nodeRefs: MutableRefObject<Map<string, HTMLDivElement>>
}) {
  const hasChildren = Boolean(node.children?.length)
  const isExpanded = !hasChildren || expandedNodeIds.has(node.id)

  return (
    <li className={cn('org-tree-node flex flex-col items-center', hasChildren && isExpanded && 'org-tree-node--branch')}>
      <div className="org-tree-card-slot relative z-[1]">
        <OrgChartNodeCard
          node={node}
          isSelected={selectedNodeId === node.id}
          isHighlighted={highlightedNodeId === node.id}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          onSelect={onSelectNode}
          onToggleExpand={onToggleExpand}
          nodeRef={(element) => {
            if (element) nodeRefs.current.set(node.id, element)
            else nodeRefs.current.delete(node.id)
          }}
        />
      </div>

      {hasChildren && isExpanded && (
        <ul className="org-tree-children flex min-w-max items-start">
          {node.children!.map((child) => (
            <OrgChartTreeBranch
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              highlightedNodeId={highlightedNodeId}
              expandedNodeIds={expandedNodeIds}
              onSelectNode={onSelectNode}
              onToggleExpand={onToggleExpand}
              nodeRefs={nodeRefs}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

interface OrgChartMobileListProps {
  nodes: Array<OrgChartNode & { depth: number }>
  selectedNodeId: string | null
  highlightedNodeId: string | null
  onSelectNode: (node: OrgChartNode) => void
}

export function OrgChartMobileList({
  nodes,
  selectedNodeId,
  highlightedNodeId,
  onSelectNode,
}: OrgChartMobileListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!highlightedNodeId || !listRef.current) return
    const element = listRef.current.querySelector(`[data-org-node-id="${highlightedNodeId}"]`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightedNodeId])

  return (
    <div ref={listRef} className="space-y-2 md:hidden">
      {nodes.map((node) => (
        <div key={node.id} style={{ paddingLeft: `${node.depth * 16}px` }}>
          <OrgChartNodeCard
            node={node}
            isSelected={selectedNodeId === node.id}
            isHighlighted={highlightedNodeId === node.id}
            isExpanded
            hasChildren={false}
            onSelect={onSelectNode}
            onToggleExpand={() => undefined}
            compact
          />
        </div>
      ))}
    </div>
  )
}

export function OrgChartCanvas({
  roots,
  flatNodes,
  selectedNodeId,
  highlightedNodeId,
  expandedNodeIds,
  onSelectNode,
  onToggleExpand,
}: OrgChartTreeProps & {
  flatNodes: Array<OrgChartNode & { depth: number }>
}) {
  return (
    <>
      <OrgChartTree
        roots={roots}
        selectedNodeId={selectedNodeId}
        highlightedNodeId={highlightedNodeId}
        expandedNodeIds={expandedNodeIds}
        onSelectNode={onSelectNode}
        onToggleExpand={onToggleExpand}
      />
      <OrgChartMobileList
        nodes={flatNodes}
        selectedNodeId={selectedNodeId}
        highlightedNodeId={highlightedNodeId}
        onSelectNode={onSelectNode}
      />
    </>
  )
}
