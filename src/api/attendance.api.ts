import {
  differenceInMinutes,
  format,
  getDaysInMonth,
  isWeekend,
  parse,
} from 'date-fns'
import {
  AttendanceListResponseSchema,
  AttendanceRecordSchema,
  ClockStatusSchema,
  MyAttendanceResponseSchema,
  type AttendanceEditInput,
  type AttendanceRecord,
  type AttendanceStatus,
  type AttendanceSummary,
  type ClockStatus,
  type MyAttendanceRecord,
} from '../types/attendance.types'
import { getAllEmployeesForAttendance } from './employees.api'

const MOCK_DELAY_MS = 350

const generatedMonths = new Set<string>()
let attendanceRecords: AttendanceRecord[] = []

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function computeWorkingHours(checkIn: string, checkOut: string): string {
  const start = parse(checkIn, 'HH:mm', new Date())
  const end = parse(checkOut, 'HH:mm', new Date())
  return formatDuration(Math.max(0, differenceInMinutes(end, start)))
}

function computeSummary(records: MyAttendanceRecord[] | AttendanceRecord[]): AttendanceSummary {
  let overtimeMinutes = 0

  for (const record of records) {
    if (record.overtimeHours) {
      const match = record.overtimeHours.match(/(\d+)h(?:\s*(\d+)m)?/)
      if (match) {
        overtimeMinutes += Number(match[1]) * 60 + Number(match[2] ?? 0)
      }
    }
  }

  return {
    totalDays: records.length,
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    halfDay: records.filter((r) => r.status === 'half_day').length,
    onLeave: records.filter((r) => r.status === 'on_leave').length,
    overtime: formatDuration(overtimeMinutes),
  }
}

function monthKey(year: number, month: number) {
  return `${year}-${month}`
}

function ensureMonthData(year: number, month: number) {
  const key = monthKey(year, month)
  if (generatedMonths.has(key)) return

  const employees = getAllEmployeesForAttendance()
  const daysInMonth = getDaysInMonth(new Date(year, month - 1))
  const newRecords: AttendanceRecord[] = []

  for (const employee of employees) {
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dateObj = new Date(year, month - 1, day)
      const seed = hashSeed(`${employee.id}-${date}`)

      let status: AttendanceStatus
      if (isWeekend(dateObj)) {
        status = 'holiday'
      } else {
        const roll = seed % 100
        if (roll < 68) status = 'present'
        else if (roll < 76) status = 'late'
        else if (roll < 82) status = 'absent'
        else if (roll < 87) status = 'half_day'
        else if (roll < 92) status = 'on_leave'
        else status = 'present'
      }

      let checkIn: string | null = null
      let checkOut: string | null = null
      let workingHours: string | null = null
      let overtimeHours: string | null = null

      if (status === 'present' || status === 'late') {
        checkIn = status === 'late' ? '09:45' : `${String(8 + (seed % 2)).padStart(2, '0')}:${String((seed % 4) * 15).padStart(2, '0')}`
        checkOut = `${String(17 + (seed % 2)).padStart(2, '0')}:${String((seed % 3) * 10).padStart(2, '0')}`
        workingHours = computeWorkingHours(checkIn, checkOut)
        if (seed % 6 === 0) overtimeHours = '1h 0m'
      } else if (status === 'half_day') {
        checkIn = '09:00'
        checkOut = '13:00'
        workingHours = '4h 0m'
      }

      newRecords.push(
        AttendanceRecordSchema.parse({
          id: `att-${employee.id}-${date}`,
          employeeId: employee.id,
          employeeName: employee.fullName,
          avatarUrl: employee.avatarUrl,
          department: employee.departmentName,
          departmentId: employee.departmentId,
          date,
          checkIn,
          checkOut,
          workingHours,
          status,
          overtimeHours,
        }),
      )
    }
  }

  attendanceRecords = [...attendanceRecords, ...newRecords]
  generatedMonths.add(key)
}

function findRecord(employeeId: string, date: string): AttendanceRecord | undefined {
  return attendanceRecords.find((r) => r.employeeId === employeeId && r.date === date)
}

function upsertRecord(record: AttendanceRecord) {
  const index = attendanceRecords.findIndex((r) => r.id === record.id)
  if (index === -1) {
    attendanceRecords.push(record)
  } else {
    attendanceRecords[index] = record
  }
}

function toMyRecord(record: AttendanceRecord): MyAttendanceRecord {
  return {
    date: record.date,
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    workingHours: record.workingHours,
    status: record.status,
    overtimeHours: record.overtimeHours,
  }
}

function getTodayDate() {
  return format(new Date(), 'yyyy-MM-dd')
}

function getCurrentTime() {
  return format(new Date(), 'HH:mm')
}

export async function getAttendance(params: {
  month: number
  year: number
  employeeId?: string
  departmentId?: string
  status?: AttendanceStatus
  search?: string
  page?: number
  perPage?: number
}) {
  await delay()
  ensureMonthData(params.year, params.month)

  const monthPrefix = `${params.year}-${String(params.month).padStart(2, '0')}`
  let filtered = attendanceRecords.filter((r) => r.date.startsWith(monthPrefix))

  if (params.employeeId) {
    filtered = filtered.filter((r) => r.employeeId === params.employeeId)
  }

  if (params.departmentId) {
    filtered = filtered.filter((r) => r.departmentId === params.departmentId)
  }

  if (params.status) {
    filtered = filtered.filter((r) => r.status === params.status)
  }

  if (params.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeId.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q),
    )
  }

  filtered.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return a.employeeName.localeCompare(b.employeeName)
  })

  const page = params.page ?? 1
  const perPage = params.perPage ?? 20
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage)

  return AttendanceListResponseSchema.parse({
    data,
    total,
    page,
    perPage,
    totalPages,
    summary: computeSummary(filtered),
  })
}

export async function getMyAttendance(params: {
  month: number
  year: number
  employeeId: string
}) {
  await delay()
  ensureMonthData(params.year, params.month)

  const monthPrefix = `${params.year}-${String(params.month).padStart(2, '0')}`
  const records = attendanceRecords
    .filter((r) => r.employeeId === params.employeeId && r.date.startsWith(monthPrefix))
    .map(toMyRecord)
    .sort((a, b) => b.date.localeCompare(a.date))

  return MyAttendanceResponseSchema.parse({
    records,
    summary: computeSummary(records),
  })
}

export async function getClockStatus(employeeId: string): Promise<ClockStatus> {
  await delay(150)
  const today = getTodayDate()
  ensureMonthData(Number(today.slice(0, 4)), Number(today.slice(5, 7)))

  const record = findRecord(employeeId, today)
  const isClockedIn = Boolean(record?.checkIn && !record?.checkOut)

  return ClockStatusSchema.parse({
    isClockedIn,
    checkIn: record?.checkIn ?? null,
    checkOut: record?.checkOut ?? null,
    workingHours: record?.workingHours ?? null,
    date: today,
  })
}

export async function clockIn(employeeId: string): Promise<ClockStatus> {
  await delay(200)
  const today = getTodayDate()
  const now = getCurrentTime()
  ensureMonthData(Number(today.slice(0, 4)), Number(today.slice(5, 7)))

  const existing = findRecord(employeeId, today)
  if (existing?.checkOut) {
    throw new Error('Already completed attendance for today')
  }
  if (existing?.checkIn) {
    throw new Error('Already clocked in')
  }

  const employee = getAllEmployeesForAttendance().find((e) => e.id === employeeId)
  if (!employee) throw new Error('Employee not found')

  const isLate = Number(now.split(':')[0]) >= 9 && Number(now.split(':')[1]) > 15
  const record = AttendanceRecordSchema.parse({
    id: existing?.id ?? `att-${employeeId}-${today}`,
    employeeId,
    employeeName: employee.fullName,
    avatarUrl: employee.avatarUrl,
    department: employee.departmentName,
    departmentId: employee.departmentId,
    date: today,
    checkIn: now,
    checkOut: null,
    workingHours: null,
    status: isLate ? 'late' : 'present',
    overtimeHours: null,
  })

  upsertRecord(record)

  return ClockStatusSchema.parse({
    isClockedIn: true,
    checkIn: now,
    checkOut: null,
    workingHours: null,
    date: today,
  })
}

export async function clockOut(employeeId: string): Promise<ClockStatus> {
  await delay(200)
  const today = getTodayDate()
  const now = getCurrentTime()

  const existing = findRecord(employeeId, today)
  if (!existing?.checkIn) {
    throw new Error('Must clock in first')
  }
  if (existing.checkOut) {
    throw new Error('Already clocked out')
  }

  const workingHours = computeWorkingHours(existing.checkIn, now)
  const startMinutes =
    Number(existing.checkIn.split(':')[0]) * 60 + Number(existing.checkIn.split(':')[1])
  const endMinutes = Number(now.split(':')[0]) * 60 + Number(now.split(':')[1])
  const overtimeMinutes = Math.max(0, endMinutes - startMinutes - 8 * 60)
  const overtimeHours = overtimeMinutes > 0 ? formatDuration(overtimeMinutes) : null

  const updated = AttendanceRecordSchema.parse({
    ...existing,
    checkOut: now,
    workingHours,
    overtimeHours,
  })

  upsertRecord(updated)

  return ClockStatusSchema.parse({
    isClockedIn: false,
    checkIn: updated.checkIn,
    checkOut: now,
    workingHours,
    date: today,
  })
}

export async function updateAttendance(id: string, data: AttendanceEditInput) {
  await delay()
  const index = attendanceRecords.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('Attendance record not found')

  const current = attendanceRecords[index]
  const checkIn = data.checkIn ?? current.checkIn
  const checkOut = data.checkOut ?? current.checkOut
  const status = data.status ?? current.status

  let workingHours = current.workingHours
  if (checkIn && checkOut) {
    workingHours = computeWorkingHours(checkIn, checkOut)
  }

  const updated = AttendanceRecordSchema.parse({
    ...current,
    checkIn: checkIn ?? null,
    checkOut: checkOut ?? null,
    status,
    workingHours,
  })

  attendanceRecords[index] = updated
  return updated
}

export async function exportAttendance(params: {
  month: number
  year: number
  departmentId?: string
}): Promise<Blob> {
  await delay(500)
  ensureMonthData(params.year, params.month)

  const monthPrefix = `${params.year}-${String(params.month).padStart(2, '0')}`
  let records = attendanceRecords.filter((r) => r.date.startsWith(monthPrefix))

  if (params.departmentId) {
    records = records.filter((r) => r.departmentId === params.departmentId)
  }

  const headers = [
    'Employee',
    'Employee ID',
    'Department',
    'Date',
    'Check In',
    'Check Out',
    'Working Hours',
    'Overtime',
    'Status',
  ]

  const rows = records.map((r) =>
    [
      r.employeeName,
      r.employeeId,
      r.department,
      r.date,
      r.checkIn ?? '',
      r.checkOut ?? '',
      r.workingHours ?? '',
      r.overtimeHours ?? '',
      r.status,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(','),
  )

  const csv = [headers.join(','), ...rows].join('\n')
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}
