import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResolvedTenant, TenantMode } from '../types/tenant.types'
import { DEFAULT_COMPANY_ID } from '../config/company.config'

interface UIState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  activeModal: string | null
  openModal: (id: string) => void
  closeModal: () => void
  activeCompanyId: string
  setActiveCompanyId: (companyId: string) => void
  tenantMode: TenantMode
  resolvedTenant: ResolvedTenant | null
  unknownTenantSlug: string | null
  setTenantResolution: (resolution: {
    mode: TenantMode
    tenant?: ResolvedTenant | null
    unknownSlug?: string | null
  }) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      activeModal: null,
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),
      activeCompanyId: DEFAULT_COMPANY_ID,
      setActiveCompanyId: (companyId) => set({ activeCompanyId: companyId }),
      tenantMode: 'loading',
      resolvedTenant: null,
      unknownTenantSlug: null,
      setTenantResolution: ({ mode, tenant = null, unknownSlug = null }) =>
        set({
          tenantMode: mode,
          resolvedTenant: tenant,
          unknownTenantSlug: unknownSlug,
        }),
    }),
    {
      name: 'smarthr-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeCompanyId: state.activeCompanyId,
      }),
    },
  ),
)
