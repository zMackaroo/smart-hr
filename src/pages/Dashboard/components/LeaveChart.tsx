import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { AdminDashboard } from '../../../types/dashboard.types'

interface LeaveChartProps {
  data: AdminDashboard['leaveDistribution']
}

export function LeaveChart({ data }: LeaveChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <h3 className="text-base font-semibold text-primary">Leave Distribution</h3>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
        <div className="h-52 w-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.type} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="w-full flex-1 space-y-3">
          {data.map((item) => (
            <li key={item.type} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-secondary">{item.type}</span>
              </span>
              <span className="font-medium text-primary">
                {item.count}
                <span className="ml-1 text-xs text-muted">
                  ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
