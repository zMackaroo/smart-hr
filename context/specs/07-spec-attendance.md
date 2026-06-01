# Spec 07 — Attendance

## Goal

Build the Attendance module. Admins see a full employee attendance table with
daily and monthly views, bulk actions, and export. Employees see only their
own attendance with a clock-in/out control and monthly calendar view.

---

## Routes

| Path          | Page               | Role       |
| ------------- | ------------------ | ---------- |
| `/attendance` | `AttendancePage`   | All roles  |

Page renders `<AdminAttendanceView>` or `<EmployeeAttendanceView>` based on role.

---

## File Structure

```
src/
├── pages/
│   └── Attendance/
│       ├── AttendancePage.tsx
│       ├── AttendancePage.viewmodel.ts
│       └── components/
│           ├── AdminAttendanceView.tsx
│           ├── AdminAttendanceView.viewmodel.ts
│           ├── EmployeeAttendanceView.tsx
│           ├── EmployeeAttendanceView.viewmodel.ts
│           ├── AttendanceCalendar.tsx
│           ├── ClockInOutCard.tsx
│           ├── AttendanceStatusBadge.tsx
│           └── AttendanceFilters.tsx
├── api/
│   └── attendance.api.ts
└── types/
    └── attendance.types.ts
```

---

## Zod Schemas & Types (`attendance.types.ts`)

```ts
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'holiday'

export const AttendanceRecordSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  avatarUrl: z.string().optional(),
  department: z.string(),
  date: z.string(),                  // ISO date "YYYY-MM-DD"
  checkIn: z.string().nullable(),    // "HH:mm"
  checkOut: z.string().nullable(),
  workingHours: z.string().nullable(), // "8h 30m"
  status: z.enum(['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday']),
  overtimeHours: z.string().nullable(),
})

export const MyAttendanceRecordSchema = z.object({
  date: z.string(),
  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),
  workingHours: z.string().nullable(),
  status: z.enum(['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday']),
  overtimeHours: z.string().nullable(),
})

export const AttendanceSummarySchema = z.object({
  totalDays: z.number(),
  present: z.number(),
  absent: z.number(),
  late: z.number(),
  halfDay: z.number(),
  onLeave: z.number(),
  overtime: z.string(),
})

export const ClockStatusSchema = z.object({
  isClockedIn: z.boolean(),
  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),
  workingHours: z.string().nullable(),
  date: z.string(),
})
```

---

## API Functions (`attendance.api.ts`)

```ts
getAttendance(params: {
  month: number           // 1–12
  year: number
  employeeId?: string     // admin only
  departmentId?: string
  status?: AttendanceStatus
  page?: number
  perPage?: number
}): Promise<{ data: AttendanceRecord[]; total: number; summary: AttendanceSummary }>
  GET /api/attendance

getMyAttendance(params: {
  month: number
  year: number
}): Promise<{ records: MyAttendanceRecord[]; summary: AttendanceSummary }>
  GET /api/attendance/me

getClockStatus(): Promise<ClockStatus>
  GET /api/attendance/clock-status

clockIn(): Promise<ClockStatus>
  POST /api/attendance/clock-in

clockOut(): Promise<ClockStatus>
  POST /api/attendance/clock-out

updateAttendance(id: string, data: {
  checkIn?: string
  checkOut?: string
  status?: AttendanceStatus
}): Promise<AttendanceRecord>
  PUT /api/attendance/:id

exportAttendance(params: {
  month: number
  year: number
  departmentId?: string
}): Promise<Blob>
  GET /api/attendance/export  (returns CSV blob)
```

---

## Admin Attendance View UI

### Page Header
- Title: "Attendance"
- Right: `[Export CSV]` button + month/year picker

### Summary Cards (5 cards in a row)
| Present | Absent | Late | Half Day | On Leave |
- Counts for the selected month

### Filter Bar
- Employee search input
- Department dropdown
- Status dropdown
- Month + Year picker (drives all data)

### Table Columns
| Employee | Date | Check In | Check Out | Working Hours | Overtime | Status | Actions |
- Employee: avatar + name + employee ID
- Status: `AttendanceStatusBadge`
- Actions: Edit icon → opens inline edit modal for that record

### Edit Attendance Modal
Fields: Check In time, Check Out time, Status dropdown
Used when admin needs to manually correct a record.

---

## Employee Attendance View UI

### Clock In / Out Card
```
┌──────────────────────────────────────────┐
│  Today — Monday, June 01 2026            │
│                                          │
│  Check In: 09:15 AM                      │
│  Check Out: —                            │
│  Working Hours: —                        │
│                                          │
│        [ Clock Out ]  ← if clocked in   │
│        [ Clock In  ]  ← if not clocked  │
└──────────────────────────────────────────┘
```
- Clock In/Out button is primary orange
- Once clocked out for the day, button is disabled with "Completed" message

### Monthly Summary Cards
Same 5-card row as admin but for the employee's own data.

### Attendance Calendar
- Full-month calendar grid
- Each date cell coloured by status:
  - Green = Present
  - Red = Absent
  - Orange = Late
  - Yellow = Half day
  - Blue = On leave
  - Grey = Holiday / weekend
- Clicking a date shows a small popover with check-in/out times

### Attendance Table
- Below calendar: same month data in table form
- Columns: Date | Day | Check In | Check Out | Working Hours | Status

---

## AttendanceStatusBadge

Extension of `StatusBadge` with attendance-specific colours:
```ts
const statusConfig = {
  present:  { label: 'Present',   className: 'bg-success-bg text-success' },
  absent:   { label: 'Absent',    className: 'bg-error-bg text-error' },
  late:     { label: 'Late',      className: 'bg-warning-bg text-warning' },
  half_day: { label: 'Half Day',  className: 'bg-info-bg text-info' },
  on_leave: { label: 'On Leave',  className: 'bg-warning-bg text-warning' },
  holiday:  { label: 'Holiday',   className: 'bg-surface-alt text-muted' },
}
```

---

## ViewModel Hooks

### `useAdminAttendanceViewModel`
```ts
returns {
  records: AttendanceRecord[]
  summary: AttendanceSummary | undefined
  isLoading: boolean
  selectedMonth: number
  selectedYear: number
  setMonth: (m: number) => void
  setYear: (y: number) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedDepartment: string
  setSelectedDepartment: (id: string) => void
  selectedStatus: AttendanceStatus | ''
  setSelectedStatus: (s: AttendanceStatus | '') => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  editingRecord: AttendanceRecord | null
  openEditModal: (record: AttendanceRecord) => void
  closeEditModal: () => void
  onSaveEdit: (data: Partial<AttendanceRecord>) => void
  onExport: () => void
  isExporting: boolean
}
```

### `useEmployeeAttendanceViewModel`
```ts
returns {
  clockStatus: ClockStatus | undefined
  records: MyAttendanceRecord[]
  summary: AttendanceSummary | undefined
  isLoading: boolean
  selectedMonth: number
  selectedYear: number
  setMonth: (m: number) => void
  setYear: (y: number) => void
  onClockIn: () => void
  onClockOut: () => void
  isClockingIn: boolean
  isClockingOut: boolean
}
```

---

## Acceptance Criteria

1. Admin sees all employees' attendance for the selected month.
2. Employee sees only their own attendance.
3. Clock In records the exact server time and updates the UI immediately.
4. Clock Out is disabled if not clocked in; Clock In disabled once clocked out for the day.
5. Calendar cells correctly reflect status colour for each day.
6. Summary cards update when month/year filter changes.
7. Admin can edit any attendance record via modal.
8. Export produces a downloadable CSV for the selected month/department.
9. Pagination works on the admin table view.
10. Loading skeleton shows while data is fetching.
