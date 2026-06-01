import {
  AdminDashboardSchema,
  EmployeeDashboardSchema,
  type AdminDashboard,
  type EmployeeDashboard,
} from '../types/dashboard.types'

const MOCK_DELAY_MS = 500

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const ADMIN_DASHBOARD: AdminDashboard = {
  stats: {
    totalEmployees: {
      label: 'Total Employees',
      value: 1284,
      trend: 12,
      trendDirection: 'up',
    },
    newJoinees: {
      label: 'New Joinees',
      value: 24,
      trend: 8,
      trendDirection: 'up',
    },
    onLeaveToday: {
      label: 'On Leave Today',
      value: 18,
      trend: 3,
      trendDirection: 'down',
    },
    pendingApprovals: {
      label: 'Pending Approvals',
      value: 7,
      trend: 2,
      trendDirection: 'up',
    },
    openPositions: {
      label: 'Open Positions',
      value: 12,
      trend: 5,
      trendDirection: 'neutral',
    },
    monthlyPayroll: {
      label: 'Monthly Payroll',
      value: 842500,
      trend: 4,
      trendDirection: 'up',
    },
  },
  attendanceSummary: [
    { date: '2026-05-26', present: 1180, absent: 42, late: 62 },
    { date: '2026-05-27', present: 1195, absent: 38, late: 51 },
    { date: '2026-05-28', present: 1172, absent: 45, late: 67 },
    { date: '2026-05-29', present: 1201, absent: 31, late: 52 },
    { date: '2026-05-30', present: 1168, absent: 49, late: 67 },
    { date: '2026-05-31', present: 890, absent: 12, late: 8 },
    { date: '2026-06-01', present: 1145, absent: 52, late: 87 },
  ],
  leaveDistribution: [
    { type: 'Annual Leave', count: 142, color: '#00D68F' },
    { type: 'Sick Leave', count: 68, color: '#FF4C61' },
    { type: 'Casual Leave', count: 45, color: '#2196F3' },
    { type: 'Maternity Leave', count: 12, color: '#FF902F' },
    { type: 'Unpaid Leave', count: 8, color: '#6E82A0' },
  ],
  recentActivities: [
    {
      id: 'act-1',
      type: 'leave',
      message: 'Sarah Chen submitted an annual leave request',
      time: '10 min ago',
    },
    {
      id: 'act-2',
      type: 'employee',
      message: 'New employee Michael Torres was onboarded',
      time: '1 hr ago',
    },
    {
      id: 'act-3',
      type: 'attendance',
      message: '3 employees marked late in Engineering',
      time: '2 hr ago',
    },
    {
      id: 'act-4',
      type: 'payroll',
      message: 'May payroll run completed successfully',
      time: '3 hr ago',
    },
    {
      id: 'act-5',
      type: 'ticket',
      message: 'Support ticket #1042 was resolved',
      time: '5 hr ago',
    },
    {
      id: 'act-6',
      type: 'leave',
      message: 'James Wilson\'s sick leave was approved',
      time: 'Yesterday',
    },
    {
      id: 'act-7',
      type: 'recruitment',
      message: 'New candidate applied for Senior Developer',
      time: 'Yesterday',
    },
    {
      id: 'act-8',
      type: 'employee',
      message: 'Emily Davis updated her profile information',
      time: '2 days ago',
    },
  ],
  upcomingHolidays: [
    { id: 'hol-1', name: 'Independence Day', date: '2026-07-04', day: 'Saturday' },
    { id: 'hol-2', name: 'Labor Day', date: '2026-09-07', day: 'Monday' },
    { id: 'hol-3', name: 'Thanksgiving', date: '2026-11-26', day: 'Thursday' },
    { id: 'hol-4', name: 'Christmas Day', date: '2026-12-25', day: 'Friday' },
    { id: 'hol-5', name: 'New Year\'s Day', date: '2027-01-01', day: 'Friday' },
  ],
  todayAttendance: [
    {
      id: 'att-1',
      employeeName: 'Sarah Chen',
      department: 'Engineering',
      checkIn: '08:55',
      checkOut: null,
      status: 'present',
    },
    {
      id: 'att-2',
      employeeName: 'Michael Torres',
      department: 'Marketing',
      checkIn: '09:22',
      checkOut: null,
      status: 'late',
    },
    {
      id: 'att-3',
      employeeName: 'Emily Davis',
      department: 'HR',
      checkIn: '08:45',
      checkOut: '17:30',
      status: 'present',
    },
    {
      id: 'att-4',
      employeeName: 'James Wilson',
      department: 'Finance',
      checkIn: null,
      checkOut: null,
      status: 'absent',
    },
    {
      id: 'att-5',
      employeeName: 'Lisa Park',
      department: 'Design',
      checkIn: '09:00',
      checkOut: null,
      status: 'half_day',
    },
  ],
}

const EMPLOYEE_DASHBOARD: EmployeeDashboard = {
  stats: {
    attendanceThisMonth: {
      label: 'Attendance This Month',
      value: 20,
      trend: 5,
      trendDirection: 'up',
    },
    leavesBalance: {
      label: 'Leave Balance',
      value: 12,
      trend: 0,
      trendDirection: 'neutral',
    },
    pendingLeaves: {
      label: 'Pending Leaves',
      value: 1,
      trend: 1,
      trendDirection: 'up',
    },
    openTickets: {
      label: 'Open Tickets',
      value: 2,
      trend: 1,
      trendDirection: 'down',
    },
  },
  todayAttendance: {
    checkIn: '09:15',
    checkOut: null,
    workingHours: null,
    status: 'late',
  },
  leaveHistory: [
    {
      id: 'lv-1',
      type: 'Annual Leave',
      from: '2026-05-10',
      to: '2026-05-12',
      days: 3,
      status: 'approved',
    },
    {
      id: 'lv-2',
      type: 'Sick Leave',
      from: '2026-04-02',
      to: '2026-04-03',
      days: 2,
      status: 'approved',
    },
    {
      id: 'lv-3',
      type: 'Casual Leave',
      from: '2026-06-15',
      to: '2026-06-16',
      days: 2,
      status: 'pending',
    },
    {
      id: 'lv-4',
      type: 'Annual Leave',
      from: '2026-03-01',
      to: '2026-03-05',
      days: 5,
      status: 'approved',
    },
    {
      id: 'lv-5',
      type: 'Sick Leave',
      from: '2026-01-20',
      to: '2026-01-20',
      days: 1,
      status: 'rejected',
    },
  ],
  upcomingHolidays: [
    { id: 'hol-1', name: 'Independence Day', date: '2026-07-04', day: 'Saturday' },
    { id: 'hol-2', name: 'Labor Day', date: '2026-09-07', day: 'Monday' },
    { id: 'hol-3', name: 'Thanksgiving', date: '2026-11-26', day: 'Thursday' },
    { id: 'hol-4', name: 'Christmas Day', date: '2026-12-25', day: 'Friday' },
    { id: 'hol-5', name: 'New Year\'s Day', date: '2027-01-01', day: 'Friday' },
  ],
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  await delay()
  return AdminDashboardSchema.parse(ADMIN_DASHBOARD)
}

export async function getEmployeeDashboard(): Promise<EmployeeDashboard> {
  await delay()
  return EmployeeDashboardSchema.parse(EMPLOYEE_DASHBOARD)
}
