import { z } from 'zod'

export type ReportType =
  | 'employee'
  | 'attendance'
  | 'leave'
  | 'payslip'
  | 'payment'
  | 'expense'
  | 'user_activity'

export const ReportMetaSchema = z.object({
  type: z.enum([
    'employee',
    'attendance',
    'leave',
    'payslip',
    'payment',
    'expense',
    'user_activity',
  ]),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  available: z.boolean(),
})
export type ReportMeta = z.infer<typeof ReportMetaSchema>

export const ReportFilterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  month: z.number().optional(),
  year: z.number().optional(),
  departmentId: z.string().optional(),
  employeeId: z.string().optional(),
  status: z.string().optional(),
})
export type ReportFilter = z.infer<typeof ReportFilterSchema>

export const ReportColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  align: z.enum(['left', 'right', 'center']).default('left'),
})
export type ReportColumn = z.infer<typeof ReportColumnSchema>

export const ReportDataSchema = z.object({
  type: z.enum([
    'employee',
    'attendance',
    'leave',
    'payslip',
    'payment',
    'expense',
    'user_activity',
  ]),
  title: z.string(),
  generatedAt: z.string(),
  filters: ReportFilterSchema,
  columns: z.array(ReportColumnSchema),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))),
  totalRows: z.number(),
})
export type ReportData = z.infer<typeof ReportDataSchema>

export type ReportRow = Record<string, string | number | null>

export const REPORT_FILTER_CONFIG: Record<
  ReportType,
  Array<'departmentId' | 'status' | 'month' | 'year' | 'dateFrom' | 'dateTo' | 'employeeId'>
> = {
  employee: ['departmentId', 'status'],
  attendance: ['month', 'year', 'departmentId', 'status'],
  leave: ['month', 'year', 'departmentId', 'status'],
  payslip: ['month', 'year', 'departmentId'],
  payment: ['month', 'year', 'departmentId'],
  expense: [],
  user_activity: ['dateFrom', 'dateTo', 'employeeId'],
}

export function getDefaultReportFilters(type: ReportType): ReportFilter {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const dateTo = now.toISOString().split('T')[0]
  const dateFrom = new Date(now)
  dateFrom.setDate(dateFrom.getDate() - 30)

  switch (type) {
    case 'user_activity':
      return {
        dateFrom: dateFrom.toISOString().split('T')[0],
        dateTo,
      }
    case 'employee':
      return {}
    default:
      return { month, year }
  }
}
