import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'

const DESKTOP_BREAKPOINT = 1024

export function useResponsiveSidebar() {
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${DESKTOP_BREAKPOINT - 1}px)`)

    const applyMatch = (matches: boolean) => {
      if (matches) {
        setSidebarCollapsed(true)
      }
    }

    applyMatch(mediaQuery.matches)

    const onChange = (event: MediaQueryListEvent) => {
      applyMatch(event.matches)
    }

    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [setSidebarCollapsed])
}
