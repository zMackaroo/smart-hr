import {
  Briefcase,
  Calendar,
  Clock,
  Banknote,
  UserPlus,
  Users,
} from 'lucide-react'
import { AttendanceChart, ChartSkeleton } from './AttendanceChart'
import { DashboardErrorBanner } from './DashboardErrorBanner'
import { LeaveChart } from './LeaveChart'
import { RecentActivities } from './RecentActivities'
import { StatCard, StatCardSkeleton } from './StatCard'
import { TodayAttendanceTable, TableSkeleton } from './TodayAttendanceTable'
import { UpcomingHolidays } from './UpcomingHolidays'
import { useAdminDashboardViewModel } from './AdminDashboard.viewmodel'

export function AdminDashboard() {
  const { data, isLoading, error, retry } = useAdminDashboardViewModel()

  if (error) {
    return <DashboardErrorBanner message={error} onRetry={retry} />
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <ChartSkeleton title="Attendance Overview" />
          </div>
          <div className="xl:col-span-2">
            <ChartSkeleton title="Leave Distribution" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <TableSkeleton title="Today's Attendance" />
          </div>
          <div className="space-y-6 xl:col-span-2">
            <div className="animate-pulse rounded-lg border border-border/70 bg-surface p-5 shadow-card">
              <div className="h-5 w-36 rounded bg-surface-alt" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-surface-alt" />
                ))}
              </div>
            </div>
            <div className="animate-pulse rounded-lg border border-border/70 bg-surface p-5 shadow-card">
              <div className="h-5 w-32 rounded bg-surface-alt" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 rounded bg-surface-alt" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { stats } = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
        <StatCard {...stats.totalEmployees} icon={Users} tint="blue" />
        <StatCard {...stats.newJoinees} icon={UserPlus} tint="green" />
        <StatCard {...stats.onLeaveToday} icon={Calendar} tint="orange" />
        <StatCard {...stats.pendingApprovals} icon={Clock} tint="yellow" />
        <StatCard {...stats.openPositions} icon={Briefcase} tint="purple" />
        <StatCard
          {...stats.monthlyPayroll}
          icon={Banknote}
          tint="teal"
          valueFormat="currency"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <AttendanceChart data={data.attendanceSummary} />
        </div>
        <div className="xl:col-span-2">
          <LeaveChart data={data.leaveDistribution} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <TodayAttendanceTable records={data.todayAttendance} />
        </div>
        <div className="space-y-6 xl:col-span-2">
          <UpcomingHolidays holidays={data.upcomingHolidays} />
          <RecentActivities activities={data.recentActivities} />
        </div>
      </div>
    </div>
  )
}
