import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from './components/shared/ToastContainer'
import { TenantProvider } from './components/tenant/TenantProvider'
import { AppRoutes } from './router/routes'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TenantProvider>
          <AppRoutes />
          <ToastContainer />
        </TenantProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
