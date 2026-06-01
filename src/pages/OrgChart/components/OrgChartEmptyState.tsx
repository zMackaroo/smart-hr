export function OrgChartEmptyState() {
  return (
    <div className="rounded-lg border border-border/70 bg-surface px-6 py-16 text-center shadow-card">
      <h3 className="text-lg font-semibold text-primary">No reporting hierarchy configured</h3>
      <p className="mt-2 text-sm text-secondary">
        Assign reporting managers on employee profiles to build your organisation chart.
      </p>
    </div>
  )
}
