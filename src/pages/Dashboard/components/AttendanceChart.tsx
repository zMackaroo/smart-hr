import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { AdminDashboard } from '../../../types/dashboard.types'

interface AttendanceChartProps {
  data: AdminDashboard['attendanceSummary']
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: format(parseISO(item.date), 'MMM d'),
  }))

  return (
    <div className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <h3 className="text-base font-semibold text-primary">Attendance Overview</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
              iconType="circle"
            />
            <Bar dataKey="present" name="Present" fill="var(--state-success)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" name="Absent" fill="var(--state-error)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" name="Late" fill="var(--state-warning)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ChartSkeleton({ title }: { title: string }) {
  return (
    <div className="animate-pulse rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <div className="h-5 w-40 rounded bg-surface-alt" />
      <p className="mt-1 text-sm text-transparent">{title}</p>
      <div className="mt-4 h-72 rounded-lg bg-surface-alt" />
    </div>
  )
}
