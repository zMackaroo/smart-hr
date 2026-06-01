import {
  OrgChartNodeSchema,
  OrgChartTreeSchema,
  type OrgChartNode,
  type OrgChartTree,
} from '../types/org-chart.types'
import { getAllEmployeesForOrgChart } from './employees.api'

const MOCK_DELAY_MS = 350

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type OrgEmployee = ReturnType<typeof getAllEmployeesForOrgChart>[number]

function toOrgChartNode(employee: OrgEmployee, children?: OrgChartNode[]): OrgChartNode {
  return OrgChartNodeSchema.parse({
    id: employee.id,
    employeeId: employee.employeeId,
    name: employee.fullName,
    avatarUrl: employee.avatarUrl,
    designation: employee.designationName,
    department: employee.departmentName,
    departmentId: employee.departmentId,
    managerId: employee.managerId,
    managerName: employee.managerName,
    status: employee.status,
    directReportsCount: children?.length ?? 0,
    children: children && children.length > 0 ? children : undefined,
  })
}

function detectCycle(employeeId: string, managerId: string | undefined, map: Map<string, OrgEmployee>): boolean {
  if (!managerId) return false
  const visited = new Set<string>([employeeId])
  let currentId: string | undefined = managerId

  while (currentId) {
    if (visited.has(currentId)) {
      if (import.meta.env.DEV) {
        console.warn(
          `[org-chart] Circular manager reference detected involving employee ${employeeId}`,
        )
      }
      return true
    }
    visited.add(currentId)
    currentId = map.get(currentId)?.managerId
  }

  return false
}

function buildFullTree(
  employees: OrgEmployee[],
): { roots: OrgChartNode[]; orphanedNodes: number } {
  const map = new Map(employees.map((employee) => [employee.id, employee]))
  const childrenMap = new Map<string, string[]>()
  let orphanedNodes = 0

  for (const employee of employees) {
    const managerId = employee.managerId
    if (!managerId) continue

    const managerExists = map.has(managerId)
    const hasCycle = detectCycle(employee.id, managerId, map)

    if (!managerExists || hasCycle) {
      orphanedNodes += 1
      continue
    }

    const siblings = childrenMap.get(managerId) ?? []
    siblings.push(employee.id)
    childrenMap.set(managerId, siblings)
  }

  const buildNode = (employeeId: string, stack = new Set<string>()): OrgChartNode | null => {
    if (stack.has(employeeId)) return null
    const employee = map.get(employeeId)
    if (!employee) return null

    stack.add(employeeId)
    const childIds = childrenMap.get(employeeId) ?? []
    const children = childIds
      .map((childId) => buildNode(childId, stack))
      .filter((node): node is OrgChartNode => node !== null)
      .sort((a, b) => a.name.localeCompare(b.name))

    stack.delete(employeeId)
    return toOrgChartNode(employee, children)
  }

  const roots = employees
    .filter((employee) => {
      if (!employee.managerId) return true
      if (!map.has(employee.managerId)) return true
      return detectCycle(employee.id, employee.managerId, map)
    })
    .map((employee) => buildNode(employee.id))
    .filter((node): node is OrgChartNode => node !== null)
    .sort((a, b) => a.name.localeCompare(b.name))

  return { roots, orphanedNodes }
}

function countNodes(nodes: OrgChartNode[]): number {
  return nodes.reduce(
    (total, node) => total + 1 + (node.children ? countNodes(node.children) : 0),
    0,
  )
}

function findNode(nodes: OrgChartNode[], employeeId: string): OrgChartNode | null {
  for (const node of nodes) {
    if (node.id === employeeId) return node
    if (node.children) {
      const found = findNode(node.children, employeeId)
      if (found) return found
    }
  }
  return null
}

function cloneNodeWithoutChildren(node: OrgChartNode): OrgChartNode {
  return { ...node, children: undefined, directReportsCount: 0 }
}

function filterByDepartment(tree: OrgChartTree, departmentId: string): OrgChartTree {
  const filterNode = (node: OrgChartNode): OrgChartNode | null => {
    const filteredChildren = (node.children ?? [])
      .map(filterNode)
      .filter((child): child is OrgChartNode => child !== null)

    const inDepartment = node.departmentId === departmentId
    if (!inDepartment && filteredChildren.length === 0) return null

    return {
      ...node,
      children: filteredChildren.length > 0 ? filteredChildren : undefined,
      directReportsCount: filteredChildren.length,
    }
  }

  const roots = tree.roots
    .map(filterNode)
    .filter((node): node is OrgChartNode => node !== null)

  return OrgChartTreeSchema.parse({
    roots,
    totalNodes: countNodes(roots),
    orphanedNodes: tree.orphanedNodes,
  })
}

function filterTerminated(tree: OrgChartTree): OrgChartTree {
  const filterNode = (node: OrgChartNode): OrgChartNode | null => {
    if (node.status === 'terminated') return null

    const filteredChildren = (node.children ?? [])
      .map(filterNode)
      .filter((child): child is OrgChartNode => child !== null)

    return {
      ...node,
      children: filteredChildren.length > 0 ? filteredChildren : undefined,
      directReportsCount: filteredChildren.length,
    }
  }

  const roots = tree.roots
    .map(filterNode)
    .filter((node): node is OrgChartNode => node !== null)

  return OrgChartTreeSchema.parse({
    roots,
    totalNodes: countNodes(roots),
    orphanedNodes: tree.orphanedNodes,
  })
}

function limitDepth(nodes: OrgChartNode[], maxDepth: number, depth = 1): OrgChartNode[] {
  return nodes.map((node) => {
    if (depth >= maxDepth || !node.children?.length) {
      return { ...node, children: undefined, directReportsCount: node.children?.length ?? 0 }
    }

    return {
      ...node,
      children: limitDepth(node.children, maxDepth, depth + 1),
      directReportsCount: node.children.length,
    }
  })
}

function buildScopedTree(fullTree: OrgChartTree, employeeId: string): OrgChartTree {
  const chain = buildEmployeeChain(fullTree.roots, employeeId)
  if (chain.length === 0) {
    return OrgChartTreeSchema.parse({ roots: [], totalNodes: 0, orphanedNodes: fullTree.orphanedNodes })
  }

  const focusNode = findNode(fullTree.roots, employeeId)
  const directReports = (focusNode?.children ?? []).map((child) =>
    cloneNodeWithoutChildren(child),
  )

  let scopedRoot = cloneNodeWithoutChildren(chain[0])
  let current = scopedRoot

  for (let index = 1; index < chain.length; index += 1) {
    const next = cloneNodeWithoutChildren(chain[index])
    current.children = [next]
    current.directReportsCount = 1
    current = next
  }

  if (directReports.length > 0) {
    current.children = directReports
    current.directReportsCount = directReports.length
  }

  return OrgChartTreeSchema.parse({
    roots: [scopedRoot],
    totalNodes: countNodes([scopedRoot]),
    orphanedNodes: fullTree.orphanedNodes,
  })
}

function buildEmployeeChain(roots: OrgChartNode[], employeeId: string): OrgChartNode[] {
  const path: OrgChartNode[] = []

  const walk = (nodes: OrgChartNode[], trail: OrgChartNode[]): boolean => {
    for (const node of nodes) {
      const nextTrail = [...trail, cloneNodeWithoutChildren(node)]
      if (node.id === employeeId) {
        path.push(...nextTrail)
        return true
      }
      if (node.children && walk(node.children, nextTrail)) return true
    }
    return false
  }

  walk(roots, [])
  return path
}

function buildTreeFromEmployees(
  employees: OrgEmployee[],
  params?: {
    departmentId?: string
    rootEmployeeId?: string
    maxDepth?: number
    hideTerminated?: boolean
    scopedEmployeeId?: string
  },
): OrgChartTree {
  const { roots, orphanedNodes } = buildFullTree(employees)
  let tree = OrgChartTreeSchema.parse({
    roots,
    totalNodes: countNodes(roots),
    orphanedNodes,
  })

  if (params?.hideTerminated) {
    tree = filterTerminated(tree)
  }

  if (params?.departmentId) {
    tree = filterByDepartment(tree, params.departmentId)
  }

  if (params?.scopedEmployeeId) {
    tree = buildScopedTree(tree, params.scopedEmployeeId)
  } else if (params?.rootEmployeeId) {
    const node = findNode(tree.roots, params.rootEmployeeId)
    tree = OrgChartTreeSchema.parse({
      roots: node ? [node] : [],
      totalNodes: node ? countNodes([node]) : 0,
      orphanedNodes: tree.orphanedNodes,
    })
  }

  if (params?.maxDepth) {
    tree = OrgChartTreeSchema.parse({
      ...tree,
      roots: limitDepth(tree.roots, params.maxDepth),
      totalNodes: countNodes(limitDepth(tree.roots, params.maxDepth)),
    })
  }

  return tree
}

export async function getOrgChartTree(params?: {
  departmentId?: string
  rootEmployeeId?: string
  maxDepth?: number
  hideTerminated?: boolean
  scopedEmployeeId?: string
}): Promise<OrgChartTree> {
  await delay()
  const employees = getAllEmployeesForOrgChart()
  return buildTreeFromEmployees(employees, {
    ...params,
    maxDepth: params?.maxDepth ?? (params?.scopedEmployeeId ? undefined : 4),
  })
}

export async function getOrgChartNode(employeeId: string): Promise<OrgChartNode> {
  await delay(150)
  const employees = getAllEmployeesForOrgChart()
  const employee = employees.find((item) => item.id === employeeId)
  if (!employee) throw new Error('Employee not found')

  const { roots } = buildFullTree(employees)
  const node = findNode(roots, employeeId)
  if (!node) {
    return toOrgChartNode(employee)
  }
  return node
}

export async function getEmployeeChain(employeeId: string): Promise<OrgChartNode[]> {
  await delay(150)
  const employees = getAllEmployeesForOrgChart()
  const { roots } = buildFullTree(employees)
  return buildEmployeeChain(roots, employeeId)
}

export function collectExpandableNodeIds(nodes: OrgChartNode[]): string[] {
  const ids: string[] = []
  const walk = (items: OrgChartNode[]) => {
    for (const node of items) {
      if (node.children?.length) {
        ids.push(node.id)
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return ids
}

export function flattenOrgChart(nodes: OrgChartNode[], depth = 0): Array<OrgChartNode & { depth: number }> {
  return nodes.flatMap((node) => [
    { ...node, depth },
    ...(node.children ? flattenOrgChart(node.children, depth + 1) : []),
  ])
}

export function findDirectReports(tree: OrgChartTree, employeeId: string): OrgChartNode[] {
  const node = findNode(tree.roots, employeeId)
  return node?.children ?? []
}
