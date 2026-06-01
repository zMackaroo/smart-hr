import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { getDepartments } from '../../api/departments.api'
import {
  collectExpandableNodeIds,
  findDirectReports,
  flattenOrgChart,
  getOrgChartTree,
} from '../../api/org-chart.api'
import { ORG_CHART_QUERY_KEY } from '../../types/org-chart.types'
import { useDebounce } from '../../hooks/useDebounce'
import { useAuthStore } from '../../store/authStore'
import type { OrgChartNode } from '../../types/org-chart.types'

function findNodeBySearch(nodes: OrgChartNode[], query: string): OrgChartNode | null {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return null

  const walk = (items: OrgChartNode[]): OrgChartNode | null => {
    for (const node of items) {
      if (
        node.name.toLowerCase().includes(normalized) ||
        node.employeeId.toLowerCase().includes(normalized) ||
        node.designation.toLowerCase().includes(normalized)
      ) {
        return node
      }
      if (node.children) {
        const found = walk(node.children)
        if (found) return found
      }
    }
    return null
  }

  return walk(nodes)
}

export function useOrgChartPageViewModel() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'super_admin' || user?.role === 'hr_admin'

  const [departmentFilter, setDepartmentFilter] = useState('')
  const [hideTerminated, setHideTerminated] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNode, setSelectedNode] = useState<OrgChartNode | null>(null)
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set())
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const { data: tree, isLoading } = useQuery({
    queryKey: [
      ...ORG_CHART_QUERY_KEY,
      departmentFilter,
      hideTerminated,
      isAdmin ? 'admin' : user?.id,
    ],
    queryFn: () =>
      getOrgChartTree({
        departmentId: departmentFilter || undefined,
        hideTerminated,
        scopedEmployeeId: isAdmin ? undefined : user?.id,
      }),
  })

  const flatNodes = useMemo(
    () => (tree ? flattenOrgChart(tree.roots) : []),
    [tree],
  )

  const directReports = useMemo(
    () => (tree && selectedNode ? findDirectReports(tree, selectedNode.id) : []),
    [tree, selectedNode],
  )

  useEffect(() => {
    if (!tree) return
    setExpandedNodeIds(new Set(collectExpandableNodeIds(tree.roots)))
  }, [tree])

  useEffect(() => {
    if (!tree || !debouncedSearch.trim()) {
      setHighlightedNodeId(null)
      return
    }

    const match = findNodeBySearch(tree.roots, debouncedSearch)
    if (match) {
      setHighlightedNodeId(match.id)
      setSelectedNode(match)
    } else {
      setHighlightedNodeId(null)
    }
  }, [debouncedSearch, tree])

  const expandAll = () => {
    if (!tree) return
    setExpandedNodeIds(new Set(collectExpandableNodeIds(tree.roots)))
  }

  const collapseAll = () => {
    setExpandedNodeIds(new Set())
  }

  const toggleExpand = (nodeId: string) => {
    setExpandedNodeIds((current) => {
      const next = new Set(current)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return next
    })
  }

  const handleSelectNode = (nodeOrId: OrgChartNode | string) => {
    const nodeId = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.id
    const fullNode = flatNodes.find((item) => item.id === nodeId)
    if (fullNode) {
      setSelectedNode(fullNode)
      return
    }

    if (typeof nodeOrId !== 'string') {
      setSelectedNode(nodeOrId)
    }
  }

  return {
    tree,
    isLoading,
    selectedNode,
    setSelectedNode: handleSelectNode,
    departmentFilter,
    setDepartmentFilter,
    hideTerminated,
    setHideTerminated,
    departments,
    searchQuery,
    setSearchQuery,
    highlightedNodeId,
    isAdmin,
    expandedNodeIds,
    toggleExpand,
    expandAll,
    collapseAll,
    flatNodes,
    directReports,
  }
}
