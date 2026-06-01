import { z } from 'zod'

export const StatCardDataSchema = z.object({
  label: z.string(),
  value: z.number(),
  trend: z.number().optional(),
  trendDirection: z.enum(['up', 'down', 'neutral']).optional(),
})
export type StatCardData = z.infer<typeof StatCardDataSchema>

export const AdminDashboardSchema = z.object({
  stats: z.object({
    totalEmployees: StatCardDataSchema,
    newJoinees: StatCardDataSchema,
    onLeaveToday: StatCardDataSchema,
    pendingApprovals: StatCardDataSchema,
    openPositions: StatCardDataSchema,
    monthlyPayroll: StatCardDataSchema,
  }),
  attendanceSummary: z.array(
    z.object({
      date: z.string(),
      present: z.number(),
      absent: z.number(),
      late: z.number(),
    }),
  ),
  leaveDistribution: z.array(
    z.object({
      type: z.string(),
      count: z.number(),
      color: z.string(),
    }),
  ),
  recentActivities: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      message: z.string(),
      time: z.string(),
      avatarUrl: z.string().optional(),
    }),
  ),
  upcomingHolidays: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      date: z.string(),
      day: z.string(),
    }),
  ),
  todayAttendance: z.array(
    z.object({
      id: z.string(),
      employeeName: z.string(),
      avatarUrl: z.string().optional(),
      department: z.string(),
      checkIn: z.string().nullable(),
      checkOut: z.string().nullable(),
      status: z.enum(['present', 'absent', 'late', 'half_day']),
    }),
  ),
})
export type AdminDashboard = z.infer<typeof AdminDashboardSchema>

export const EmployeeDashboardSchema = z.object({
  stats: z.object({
    attendanceThisMonth: StatCardDataSchema,
    leavesBalance: StatCardDataSchema,
    pendingLeaves: StatCardDataSchema,
    openTickets: StatCardDataSchema,
  }),
  todayAttendance: z.object({
    checkIn: z.string().nullable(),
    checkOut: z.string().nullable(),
    workingHours: z.string().nullable(),
    status: z.enum(['present', 'absent', 'late', 'not_marked']),
  }),
  leaveHistory: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      from: z.string(),
      to: z.string(),
      days: z.number(),
      status: z.enum(['approved', 'pending', 'rejected']),
    }),
  ),
  upcomingHolidays: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      date: z.string(),
      day: z.string(),
    }),
  ),
})
export type EmployeeDashboard = z.infer<typeof EmployeeDashboardSchema>
