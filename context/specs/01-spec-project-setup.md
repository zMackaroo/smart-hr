# Spec 01 — Project Setup

## Goal

Bootstrap the React + TypeScript + Vite project with all dependencies installed,
folder structure created, design tokens wired, and a working router scaffold.
No features — just the empty but correctly structured shell that every subsequent
spec builds on.

## Acceptance Criteria

1. `npm run dev` starts without errors.
2. `npm run build` passes with zero TypeScript errors.
3. All CSS custom property tokens are defined in `src/index.css`.
4. Tailwind theme maps tokens to named colour utilities.
5. Folder structure matches `architecture.md` exactly.
6. React Router renders a `<NotFound>` page at any unknown route.
7. `authStore` exists with `isAuthenticated`, `user`, `token`, `login()`, `logout()`.
8. `ProtectedRoute` redirects unauthenticated users to `/login`.

---

## Dependencies to Install

```bash
# Core
npm create vite@latest smarthr -- --template react-ts
cd smarthr

# Routing
npm i react-router-dom

# State
npm i zustand

# Data fetching
npm i @tanstack/react-query axios

# Forms
npm i react-hook-form @hookform/resolvers zod

# Tables
npm i @tanstack/react-table

# Charts
npm i recharts

# Date
npm i date-fns

# Icons
npm i lucide-react

# Styling utilities
npm i clsx tailwind-merge

# Tailwind
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Folder Structure to Scaffold

```
src/
├── assets/
│   └── logo.svg
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── PageHeader.tsx
│   └── shared/
│       ├── StatusBadge.tsx
│       ├── EmptyState.tsx
│       └── ConfirmDialog.tsx
├── hooks/
│   ├── useDebounce.ts
│   └── usePagination.ts
├── store/
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── notificationStore.ts
├── pages/
│   ├── Auth/
│   │   └── (placeholder)
│   └── NotFound/
│       └── NotFoundPage.tsx
├── api/
│   └── axios.ts          ← base Axios instance + interceptors
├── types/
│   └── common.types.ts   ← shared enums (Role, Status) and paginated response type
├── utils/
│   ├── cn.ts             ← clsx + twMerge helper
│   └── date.utils.ts
├── router/
│   ├── routes.tsx
│   └── ProtectedRoute.tsx
├── index.css             ← CSS custom properties (all tokens)
└── main.tsx
```

---

## CSS Custom Properties (`src/index.css`)

```css
:root {
  --bg-base:             #F5F6FA;
  --bg-surface:          #FFFFFF;
  --bg-surface-alt:      #F8F9FC;

  --accent-primary:      #FF902F;
  --accent-primary-dark: #E07B1A;
  --accent-secondary:    #1B2E4B;

  --text-primary:        #1B2E4B;
  --text-secondary:      #6E82A0;
  --text-muted:          #A3B1C6;

  --border-default:      #E8EEF4;
  --border-focus:        #FF902F;

  --state-success:       #00D68F;
  --state-success-bg:    #E6FBF4;
  --state-warning:       #FFAA00;
  --state-warning-bg:    #FFF8E6;
  --state-error:         #FF4C61;
  --state-error-bg:      #FFEEF0;
  --state-info:          #2196F3;
  --state-info-bg:       #E8F4FD;

  --sidebar-bg:          #1B2E4B;
  --sidebar-text:        #A3BDCC;
  --sidebar-active:      #FFFFFF;
  --sidebar-active-bg:   #FF902F;

  --shadow-card:         0 2px 8px rgba(27, 46, 75, 0.08);

  --font-sans:           'Nunito', sans-serif;
  --font-mono:           'JetBrains Mono', monospace;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-base);
  color: var(--text-primary);
}
```

---

## `tailwind.config.ts` Theme Extension

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base:      'var(--bg-base)',
        surface:   'var(--bg-surface)',
        accent:    'var(--accent-primary)',
        'accent-dark': 'var(--accent-primary-dark)',
        navy:      'var(--accent-secondary)',
        primary:   'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted:     'var(--text-muted)',
        border:    'var(--border-default)',
        success:   'var(--state-success)',
        warning:   'var(--state-warning)',
        error:     'var(--state-error)',
        info:      'var(--state-info)',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## `authStore.ts` Shape

```ts
interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

interface AuthUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'hr_admin' | 'employee'
  avatarUrl?: string
}
```

Token is persisted to `localStorage` via Zustand persist middleware.

---

## `uiStore.ts` Shape

```ts
interface UIState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  activeModal: string | null
  openModal: (id: string) => void
  closeModal: () => void
}
```

---

## `axios.ts` — Base Instance

```ts
// Attaches Authorization header from authStore token on every request.
// Intercepts 401 → calls authStore.logout() → redirects to /login.
```

---

## Router Scaffold (`routes.tsx`)

```
/                   → redirect to /dashboard (if authed) or /login
/login              → LoginPage (public)
/register           → RegisterPage (public)
/forgot-password    → ForgotPasswordPage (public)
/reset-password     → ResetPasswordPage (public)
/verify-email       → EmailVerificationPage (public)
/dashboard          → DashboardPage (protected) inside AppShell
/employees          → EmployeesPage (protected) inside AppShell
  /employees/:id    → EmployeeDetailPage
/departments        → DepartmentsPage (protected)
/designations       → DesignationsPage (protected)
/attendance         → AttendancePage (protected)
/leaves             → LeavesPage (protected)
/payroll/salary     → EmployeeSalaryPage (protected)
/payroll/payslip    → PayslipPage (protected)
/payroll/expenses   → ExpensesPage (protected)
/payroll/provident  → ProvidentFundPage (protected)
/recruitment/jobs   → JobsPage (protected)
/recruitment/candidates → CandidatesPage (protected)
/recruitment/referrals  → ReferralsPage (protected)
/tickets            → TicketsPage (protected)
  /tickets/:id      → TicketDetailPage
/reports            → ReportsPage (protected)
/settings           → SettingsPage (protected, admin only)
*                   → NotFoundPage
```

---

## UI Notes

- This spec produces no visible UI except the `/404` page and a bare AppShell skeleton.
- AppShell renders `<Sidebar>` + `<Topbar>` + `<Outlet>` but sidebar/topbar can
  be empty nav shells at this stage.
- All page components under `/pages/` can be empty `<div>Page name</div>` stubs.

---

## Open Questions Resolved at Setup

None — all decisions are captured in context files.
