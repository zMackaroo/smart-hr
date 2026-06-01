import { z } from 'zod'

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'on_leave'
  | 'holiday'

export const AttendanceRecordSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  avatarUrl: z.string().optional(),
  department: z.string(),
  departmentId: z.string(),
  date: z.string(),
  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),
  workingHours: z.string().nullable(),
  status: z.enum(['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday']),
  overtimeHours: z.string().nullable(),
})
export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>

export const MyAttendanceRecordSchema = z.object({
  date: z.string(),
  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),
  workingHours: z.string().nullable(),
  status: z.enum(['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday']),
  overtimeHours: z.string().nullable(),
})
export type MyAttendanceRecord = z.infer<typeof MyAttendanceRecordSchema>

export const AttendanceSummarySchema = z.object({
  totalDays: z.number(),
  present: z.number(),
  absent: z.number(),
  late: z.number(),
  halfDay: z.number(),
  onLeave: z.number(),
  overtime: z.string(),
})
export type AttendanceSummary = z.infer<typeof AttendanceSummarySchema>

export const ClockStatusSchema = z.object({
  isClockedIn: z.boolean(),
  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),
  workingHours: z.string().nullable(),
  date: z.string(),
})
export type ClockStatus = z.infer<typeof ClockStatusSchema>

export const AttendanceEditSchema = z.object({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z
    .enum(['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday'])
    .optional(),
})
export type AttendanceEditInput = z.infer<typeof AttendanceEditSchema>

export const AttendanceListResponseSchema = z.object({
  data: z.array(AttendanceRecordSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
  summary: AttendanceSummarySchema,
})
export type AttendanceListResponse = z.infer<typeof AttendanceListResponseSchema>

export const MyAttendanceResponseSchema = z.object({
  records: z.array(MyAttendanceRecordSchema),
  summary: AttendanceSummarySchema,
})
export type MyAttendanceResponse = z.infer<typeof MyAttendanceResponseSchema>
