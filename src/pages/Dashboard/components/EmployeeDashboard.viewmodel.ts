import { useQuery } from '@tanstack/react-query'
import * as dashboardApi from '../../../api/dashboard.api'

export function useEmployeeDashboardViewModel() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'employee'],
    queryFn: dashboardApi.getEmployeeDashboard,
  })

  return {
    data,
    isLoading,
    error: error instanceof Error ? error.message : error ? 'Failed to load dashboard' : null,
    retry: () => void refetch(),
  }
}
