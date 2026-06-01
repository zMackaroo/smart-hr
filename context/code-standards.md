# Code Standards

## General

- Keep modules small and single-purpose. One concern per file.
- Fix root causes — do not layer workarounds or silent catches.
- Do not mix unrelated concerns in one component or ViewModel.
- Prefer explicit over implicit. Clever code costs future readers.
- All new code must be TypeScript strict-mode compatible.

## TypeScript

- `strict: true` is required in `tsconfig.json` throughout the project.
- Never use `any`. Use `unknown` at system boundaries, then narrow with Zod.
- Validate all API responses at the `src/api/` boundary with Zod schemas before
  returning data to callers.
- Define all shared domain types in `src/types/`. Do not inline complex types in
  component props.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Export types from a barrel (`index.ts`) per domain folder.

## MVVM Rules

- **View file** (`XxxPage.tsx`, `XxxView.tsx`): JSX only. The only hook it calls
  is its own ViewModel hook (`useXxxViewModel`). No `useState`, `useEffect`,
  `useRef`, or API calls inside a View.
- **ViewModel file** (`XxxPage.viewmodel.ts`): exports a single custom hook
  `useXxxViewModel()`. Owns all state, derived values, event handlers, and
  TanStack Query calls. Returns a plain object with everything the View needs.
- **Model**: API function in `src/api/` + Zod schema + TypeScript type in
  `src/types/`. No UI imports.
- If a page-local component needs its own state (e.g. a collapsible row), it
  may have internal `useState` but no business logic.

## React

- Default to functional components. No class components.
- Memoize only when there is a measurable perf issue (`React.memo`, `useMemo`,
  `useCallback`). Don't pre-optimise.
- Keep component files under 200 lines. Extract sub-components when approaching
  that limit.
- Co-locate page-local components under `pages/XxxPage/components/`.
- Global reusable components live in `src/components/` and must not import from
  `src/pages/`.

## Styling (Tailwind)

- Use CSS custom property tokens for all colours (see `ui-context.md`).
  Never hardcode hex values in `className` strings — use `text-[var(--text-primary)]`
  or map tokens to Tailwind theme extensions in `tailwind.config.ts`.
- Extend the Tailwind theme in `tailwind.config.ts` to map CSS variable tokens
  to named colours (e.g. `accent: 'var(--accent-primary)'`).
- Keep `className` strings readable — break long ones across lines with a
  `cn()` (clsx + twMerge) utility.
- No inline `style` for layout/spacing. Only use inline style for truly dynamic
  values (e.g. progress bar width as a percentage).

## API Layer (`src/api/`)

- One file per domain module (e.g. `employees.api.ts`, `leaves.api.ts`).
- Each function is async, returns a typed value, and throws on non-2xx (let
  Axios interceptor handle 401/403 globally).
- No UI imports or store imports inside `src/api/`.
- Response parsing: `Schema.parse(response.data)` before returning.

## Zustand Stores (`src/store/`)

- One store per concern (`authStore.ts`, `uiStore.ts`, `notificationStore.ts`).
- State must be JSON-serialisable (no DOM refs, no Promises).
- Actions are defined inside the store using the Zustand `set`/`get` pattern.
- Do not call API functions directly from a store. API calls belong in ViewModel
  hooks (via TanStack Query). Stores hold UI and auth state only.

## Forms

- All forms use React Hook Form with a Zod resolver.
- Schema defined in the ViewModel or co-located `*.schema.ts` file.
- Never manually manage individual field `useState` for controlled inputs —
  always use `register` or `Controller`.

## Routing (`src/router/`)

- All routes defined in a single `routes.tsx` file.
- Authenticated routes wrapped in `<ProtectedRoute>`.
- Role-gated routes wrapped in `<RoleGuard roles={[...]} />`.
- Use React Router v6 `<Outlet>` pattern for nested layouts.

## File Naming

| What                    | Convention                          | Example                          |
| ----------------------- | ----------------------------------- | -------------------------------- |
| React component file    | PascalCase `.tsx`                   | `EmployeeCard.tsx`               |
| ViewModel hook file     | PascalCase + `.viewmodel.ts`        | `EmployeesPage.viewmodel.ts`     |
| API module              | camelCase + `.api.ts`               | `employees.api.ts`               |
| Zustand store           | camelCase + `Store.ts`              | `authStore.ts`                   |
| Type/schema file        | camelCase + `.types.ts`             | `employee.types.ts`              |
| Utility file            | camelCase + `.utils.ts`             | `date.utils.ts`                  |
| Test file               | Same name + `.test.ts/tsx`          | `EmployeeCard.test.tsx`          |

## File Organisation

- `src/assets/` — Static images, SVGs, fonts. No JS logic.
- `src/components/ui/` — Headless primitive wrappers (Button, Input, Badge, Modal,
  Table, Dropdown, Tabs). Do not modify these to add domain-specific logic.
- `src/components/layout/` — Sidebar, Topbar, PageHeader, AppShell.
- `src/components/shared/` — Domain-agnostic composites (StatusBadge, AvatarUpload,
  ConfirmDialog, EmptyState, DataTable).
- `src/pages/` — One folder per route group. Each folder contains the View file,
  ViewModel file, and a `components/` subfolder for page-local components.
- `src/hooks/` — Custom hooks reused across ≥2 pages (useDebounce, usePermission,
  usePagination, useTableFilters).

## Protected Files

Do not modify without explicit instruction:

- `src/components/ui/*` — primitive UI library components
- `src/router/routes.tsx` — unless adding a new top-level route
- `tailwind.config.ts` — unless adding a new design token
