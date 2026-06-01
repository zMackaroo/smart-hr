# Architecture Context

## Stack

| Layer       | Technology                        | Role                                              |
| ----------- | --------------------------------- | ------------------------------------------------- |
| Framework   | React 18 + TypeScript + Vite      | SPA shell, routing, build tooling                 |
| Styling     | Tailwind CSS v3                   | Utility-first styling, design tokens via CSS vars |
| State       | Zustand                           | Global client state (auth, UI, module stores)     |
| Routing     | React Router v6                   | Client-side navigation, protected routes          |
| Forms       | React Hook Form + Zod             | Form state, validation schema                     |
| Data        | TanStack Query (React Query)      | Server-state caching, mutations, optimistic UI    |
| HTTP        | Axios                             | API client with interceptors                      |
| Icons       | Lucide React                      | Consistent stroke-based icon set                  |
| Tables      | TanStack Table                    | Headless data tables with sorting/filtering       |
| Charts      | Recharts                          | Dashboard KPI charts                              |
| Date        | date-fns                          | Date formatting and arithmetic                    |

## MVVM Pattern

Each feature follows a strict Model–ViewModel–View separation:

```
pages/
  Employees/
    EmployeesPage.tsx          ← View: renders JSX only, zero logic
    EmployeesPage.viewmodel.ts ← ViewModel: state, handlers, derived data
    components/                ← Page-local components (not reusable)
      EmployeeCard.tsx
      EmployeeFilters.tsx
```

- **Model** — API response types + Zod schemas (defined in `src/types/` and `src/api/`)
- **ViewModel** — Custom hook (`useXxxViewModel`) that owns all state, side effects,
  event handlers, and derived values. Returns only what the View needs.
- **View** — Pure presentational component. Calls the ViewModel hook at the top,
  destructures what it needs, renders JSX. No `useState`, `useEffect`, or business
  logic inside the View file.

## Folder Structure

```
src/
├── assets/            # Static images, SVGs, fonts
├── components/        # Globally reusable components
│   ├── ui/            # Primitive UI (Button, Input, Badge, Modal, Table…)
│   ├── layout/        # Shell components (Sidebar, Topbar, PageHeader)
│   └── shared/        # Domain-agnostic composites (AvatarUpload, StatusBadge…)
├── hooks/             # Globally shared custom hooks (useDebounce, usePermission…)
├── store/             # Zustand stores (authStore, uiStore, notificationStore)
├── pages/             # Route-level views
│   ├── Auth/
│   ├── Dashboard/
│   ├── Employees/
│   ├── Departments/
│   ├── Designations/
│   ├── Attendance/
│   ├── Leaves/
│   ├── Payroll/
│   ├── Recruitment/
│   ├── Tickets/
│   └── Reports/
├── api/               # Axios instances + per-module API functions
├── types/             # TypeScript interfaces, enums, Zod schemas
├── utils/             # Pure utility functions (formatDate, currencyFormat…)
├── router/            # Route definitions, ProtectedRoute, RoleGuard
└── main.tsx
```

## System Boundaries

- `src/pages/` — Route-level views and their page-local components. Each page
  owns its ViewModel hook and non-reusable sub-components.
- `src/components/` — Reusable components that are used across ≥2 pages.
  Must not import from `src/pages/`.
- `src/store/` — Global Zustand stores. Stores must not import from pages or
  components — only from `src/types/` and `src/api/`.
- `src/api/` — All HTTP calls. No business logic — only request shaping and
  response normalization.
- `src/types/` — Pure type definitions and Zod schemas. No side effects.

## Storage Model

- **Remote API (REST)**: All persistent data. SPA is fully API-driven.
- **Zustand (in-memory)**: Auth token, current user, UI state (sidebar open/closed,
  active modal, toast queue), and ephemeral module filters.
- **localStorage**: Auth token persistence (written by authStore on login,
  cleared on logout).

## Auth and Access Model

- JWT-based authentication. Token stored in `localStorage`, attached to every
  request via Axios request interceptor.
- Three roles: `super_admin`, `hr_admin`, `employee`.
- `ProtectedRoute` wrapper checks `authStore.isAuthenticated`.
- `RoleGuard` component/hook restricts access to role-sensitive routes and actions.
- `super_admin` sees all companies/orgs; `hr_admin` sees their own org; `employee`
  sees only their own records.

## Invariants

1. **Views contain no logic.** A View file must not call `useState`, `useEffect`,
   or any API function directly. All logic lives in the ViewModel hook.
2. **Components must not reach into page internals.** `src/components/` must never
   import from `src/pages/`.
3. **API layer is the only HTTP boundary.** No `fetch` or `axios` calls outside
   `src/api/`.
4. **Stores are flat and serialisable.** Zustand store state must be JSON-serialisable.
   No class instances, Promises, or DOM references in store.
5. **Zod validates all external data.** Every API response that enters the app is
   parsed by a Zod schema before use. Unknown shapes throw at the boundary.
6. **No hardcoded colour hex values.** All colours reference CSS custom property
   tokens defined in `src/index.css`.
