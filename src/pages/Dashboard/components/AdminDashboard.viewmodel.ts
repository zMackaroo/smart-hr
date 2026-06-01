import { useQuery } from '@tanstack/react-query'
import * as dashboardApi from '../../../api/dashboard.api'

export function useAdminDashboardViewModel() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: dashboardApi.getAdminDashboard,
  })

  return {
    data,
    isLoading,
    error: error instanceof Error ? error.message : error ? 'Failed to load dashboard' : null,
    retry: () => void refetch(),
  }
}
