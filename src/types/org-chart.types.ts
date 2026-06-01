import { z } from 'zod'

export type OrgChartNodeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated'

export interface OrgChartNode {
  id: string
  employeeId: string
  name: string
  avatarUrl?: string
  designation: string
  department: string
  departmentId: string
  managerId?: string
  managerName?: string
  status: OrgChartNodeStatus
  directReportsCount: number
  children?: OrgChartNode[]
}

export const OrgChartNodeSchema: z.ZodType<OrgChartNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    employeeId: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    designation: z.string(),
    department: z.string(),
    departmentId: z.string(),
    managerId: z.string().optional(),
    managerName: z.string().optional(),
    status: z.enum(['active', 'inactive', 'on_leave', 'terminated']),
    directReportsCount: z.number(),
    children: z.array(OrgChartNodeSchema).optional(),
  }),
)

export const OrgChartTreeSchema = z.object({
  roots: z.array(OrgChartNodeSchema),
  totalNodes: z.number(),
  orphanedNodes: z.number(),
})

export type OrgChartTree = z.infer<typeof OrgChartTreeSchema>

export const ORG_CHART_QUERY_KEY = ['org-chart'] as const
