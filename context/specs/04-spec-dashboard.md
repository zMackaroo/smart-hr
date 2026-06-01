# Spec 04 — Dashboard

## Goal

Build two dashboard views — Admin Dashboard (for `super_admin` and `hr_admin`)
and Employee Dashboard (for `employee` role). Both share the `/dashboard` route;
the correct view is rendered based on the authenticated user's role.

---

## Routes

| Path         | Component           | Role                          |
| ------------ | ------------------- | ----------------------------- |
| `/dashboard` | `DashboardPage`     | All authenticated roles       |

`DashboardPage` delegates to `<AdminDashboard>` or `<EmployeeDashboard>` based
on `authStore.user.role`.

---

## File Structure

```
src/
├── pages/
│   └── Dashboard/
│       ├── DashboardPage.tsx
│       ├── DashboardPage.viewmodel.ts
│       └── components/
│           ├── AdminDashboard.tsx
│           ├── AdminDashboard.viewmodel.ts
│           ├── EmployeeDashboard.tsx
│           ├── EmployeeDashboard.viewmodel.ts
│           ├── StatCard.tsx
│           ├── AttendanceChart.tsx
│           ├── LeaveChart.tsx
│           ├── RecentActivities.tsx
│           ├── UpcomingHolidays.tsx
│           └── TodayAttendanceTable.tsx
├── api/
│   └── dashboard.api.ts
└── types/
    └── dashboard.types.ts
```

---

## Zod Schemas & Types (`dashboard.types.ts`)

```ts
export const StatCardDataSchema = z.object({
  label: z.string(),
  value: z.number(),
  trend: z.number().optional(),       // percentage change, + or -
  trendDirection: z.enum(['up', 'down', 'neutral']).optional(),
})

export const AdminDashboardSchema = z.object({
  stats: z.object({
    totalEmployees: StatCardDataSchema,
    newJoinees: StatCardDataSchema,
    onLeaveToday: StatCardDataSchema,
    pendingApprovals: StatCardDataSchema,
    openPositions: StatCardDataSchema,
    monthlyPayroll: StatCardDataSchema,
  }),
  attendanceSummary: z.array(z.object({
    date: z.string(),
    present: z.number(),
    absent: z.number(),
    late: z.number(),
  })),
  leaveDistribution: z.array(z.object({
    type: z.string(),
    count: z.number(),
    color: z.string(),
  })),
  recentActivities: z.array(z.object({
    id: z.string(),
    type: z.string(),
    message: z.string(),
    time: z.string(),
    avatarUrl: z.string().optional(),
  })),
  upcomingHolidays: z.array(z.object({
    id: z.string(),
    name: z.string(),
    date: z.string(),
    day: z.string(),
  })),
  todayAttendance: z.array(z.object({
    id: z.string(),
    employeeName: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
    checkIn: z.string().nullable(),
    checkOut: z.string().nullable(),
    status: z.enum(['present', 'absent', 'late', 'half_day']),
  })),
})

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
  leaveHistory: z.array(z.object({
    id: z.string(),
    type: z.string(),
    from: z.string(),
    to: z.string(),
    days: z.number(),
    status: z.enum(['approved', 'pending', 'rejected']),
  })),
  upcomingHolidays: z.array(z.object({
    id: z.string(),
    name: z.string(),
    date: z.string(),
    day: z.string(),
  })),
})
```

---

## API Functions (`dashboard.api.ts`)

```ts
getAdminDashboard(): Promise<AdminDashboard>
  GET /api/dashboard/admin

getEmployeeDashboard(): Promise<EmployeeDashboard>
  GET /api/dashboard/employee
```

---

## Admin Dashboard UI

### KPI Row (6 stat cards, 3-col on desktop, 2-col tablet)

| Card               | Icon         | Colour tint |
| ------------------ | ------------ | ----------- |
| Total Employees    | Users        | Blue        |
| New Joinees        | UserPlus     | Green       |
| On Leave Today     | Calendar     | Orange      |
| Pending Approvals  | Clock        | Yellow      |
| Open Positions     | Briefcase    | Purple      |
| Monthly Payroll    | DollarSign   | Teal        |

StatCard anatomy:
```
┌──────────────────────────────┐
│ [icon circle]   [trend badge]│
│                              │
│  1,284                       │
│  Total Employees             │
└──────────────────────────────┘
```
- Icon circle: `h-12 w-12 rounded-full` with tinted background
- Value: `text-2xl font-bold text-primary`
- Label: `text-sm text-secondary`
- Trend badge: `↑ 12%` or `↓ 3%` using StatusBadge variant

### Charts Row (2 columns)

**Attendance Chart** (left, ~60% width)
- Bar chart using Recharts `BarChart`
- X axis: last 7 days (dates)
- 3 bars per day: Present (green), Absent (red), Late (orange)
- Legend below chart
- Title: "Attendance Overview"

**Leave Distribution** (right, ~40% width)
- Donut chart using Recharts `PieChart`
- Segments by leave type (Annual, Sick, Casual, etc.)
- Legend list on right side of donut
- Title: "Leave Distribution"

### Bottom Row (2 columns)

**Today's Attendance** (left, ~60%)
- Compact table: Avatar + Name | Department | Check In | Check Out | Status badge
- "View All" link → `/attendance`
- Max 5 rows, no pagination

**Upcoming Holidays + Recent Activity** (right, ~40%)
- Two stacked cards
- Holidays: list of date + holiday name, max 5
- Recent Activity: timeline list (icon + message + time), max 8 items

---

## Employee Dashboard UI

### KPI Row (4 stat cards)

| Card                   | Icon      |
| ---------------------- | --------- |
| Attendance This Month  | Clock     |
| Leave Balance          | Calendar  |
| Pending Leaves         | AlertCircle |
| Open Tickets           | Ticket    |

### Today Attendance Card
- Full-width card below KPI row
- Shows: Check-in time | Check-out time | Working hours | Status badge
- If not checked in: "You haven't checked in yet" message (check-in is done from Attendance page)

### Bottom Row (2 columns)

**Leave History** (left)
- Recent 5 leave requests: Type | From–To | Days | Status badge
- "View All" → `/leaves`

**Upcoming Holidays** (right)
- Same component as Admin dashboard

---

## ViewModel Hooks

### `useDashboardPageViewModel`
```ts
returns {
  role: UserRole
}
```
Delegates to the correct sub-dashboard based on role.

### `useAdminDashboardViewModel`
```ts
returns {
  data: AdminDashboard | undefined
  isLoading: boolean
  error: string | null
}
```

### `useEmployeeDashboardViewModel`
```ts
returns {
  data: EmployeeDashboard | undefined
  isLoading: boolean
  error: string | null
}
```

---

## Acceptance Criteria

1. Admin role (`super_admin` / `hr_admin`) sees Admin Dashboard.
2. Employee role sees Employee Dashboard.
3. All KPI stat cards render with correct values and trend badges.
4. Attendance bar chart renders with labelled axes and legend.
5. Leave donut chart renders with colour-coded segments.
6. Today's attendance table renders with status badges.
7. Loading state: skeleton placeholders replace cards and charts while fetching.
8. Error state: error banner with retry button if API call fails.
9. "View All" links navigate to the correct module pages.
10. Dashboard data refetches on window focus (TanStack Query default).
