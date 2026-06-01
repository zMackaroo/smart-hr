import {
  Briefcase,
  CalendarDays,
  Clock,
  Ticket,
  UserPlus,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AdminDashboard } from '../../../types/dashboard.types'
import { UserAvatar } from '../../../components/layout/UserAvatar'

interface RecentActivitiesProps {
  activities: AdminDashboard['recentActivities']
}

const activityIcons: Record<string, LucideIcon> = {
  leave: CalendarDays,
  employee: UserPlus,
  attendance: Clock,
  payroll: Briefcase,
  ticket: Ticket,
  recruitment: Users,
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <h3 className="text-base font-semibold text-primary">Recent Activity</h3>
      <ul className="mt-4 space-y-4">
        {activities.slice(0, 8).map((activity) => {
          const Icon = activityIcons[activity.type] ?? Users
          return (
            <li key={activity.id} className="flex gap-3">
              {activity.avatarUrl ? (
                <UserAvatar name={activity.message} avatarUrl={activity.avatarUrl} size="sm" />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-alt">
                  <Icon className="h-4 w-4 text-secondary" strokeWidth={1.5} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-primary">{activity.message}</p>
                <p className="mt-0.5 text-xs text-muted">{activity.time}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
