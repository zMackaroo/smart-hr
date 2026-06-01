import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '../types/auth.types'

interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  twoFactorEmail: string | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
  setTwoFactorPending: (email: string) => void
  clearTwoFactorPending: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      twoFactorEmail: null,
      login: (token, user) => {
        set({ token, user, isAuthenticated: true, twoFactorEmail: null })
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, twoFactorEmail: null })
      },
      setTwoFactorPending: (email) => set({ twoFactorEmail: email }),
      clearTwoFactorPending: () => set({ twoFactorEmail: null }),
    }),
    {
      name: 'smarthr-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
