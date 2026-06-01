import { Badge } from '../../../../components/ui/Badge'
import { formatDate } from '../../../../utils/date.utils'
import type { EmployeeDetail } from '../../../../types/employee.types'

interface AssetsTabProps {
  assets: EmployeeDetail['assets']
}

const assetStatusVariant: Record<
  EmployeeDetail['assets'][number]['status'],
  'success' | 'warning' | 'error'
> = {
  assigned: 'success',
  returned: 'warning',
  damaged: 'error',
}

export function AssetsTab({ assets }: AssetsTabProps) {
  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-primary">Assigned Assets</h3>
      {assets.length === 0 ? (
        <p className="text-sm text-secondary">No assets assigned.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                <th className="px-4 py-3">Asset Name</th>
                <th className="px-4 py-3">Asset ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Assigned Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-t border-border">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{asset.name}</td>
                  <td className="px-4 py-3 text-sm text-secondary">{asset.assetId}</td>
                  <td className="px-4 py-3 text-sm text-secondary">{asset.category}</td>
                  <td className="px-4 py-3 text-sm text-secondary">{formatDate(asset.assignedDate)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={assetStatusVariant[asset.status]} className="capitalize">
                      {asset.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
