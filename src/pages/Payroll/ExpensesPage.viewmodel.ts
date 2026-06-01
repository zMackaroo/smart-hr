import { useAuthStore } from '../../store/authStore'

export function useExpensesPageViewModel() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'super_admin' || user?.role === 'hr_admin'

  return { isAdmin }
}
