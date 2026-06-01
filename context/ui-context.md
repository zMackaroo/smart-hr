# UI Context

## Theme

Light mode only. The design language is a clean, corporate HR workspace:
white and very-light-grey surfaces, a deep navy/blue primary accent, generous
whitespace, and subtle card shadows. Data-heavy pages use tight but readable
table densities. No dark mode in v1.

## Colors

Defined in `src/index.css` as CSS custom properties on `:root`.
All components must use these tokens — no hardcoded hex values in JSX or CSS.

| Role               | CSS Variable            | Value       | Usage                                  |
| ------------------ | ----------------------- | ----------- | -------------------------------------- |
| Page background    | `--bg-base`             | `#F5F6FA`   | Outermost page fill                    |
| Surface            | `--bg-surface`          | `#FFFFFF`   | Cards, modals, sidebar                 |
| Surface alt        | `--bg-surface-alt`      | `#F8F9FC`   | Zebra rows, input backgrounds          |
| Primary accent     | `--accent-primary`      | `#FF902F`   | Buttons, active nav, links (SmartHR orange) |
| Primary dark       | `--accent-primary-dark` | `#E07B1A`   | Hover state for primary accent         |
| Secondary accent   | `--accent-secondary`    | `#1B2E4B`   | Sidebar background, dark headings      |
| Primary text       | `--text-primary`        | `#1B2E4B`   | Body text, table cells                 |
| Secondary text     | `--text-secondary`      | `#6E82A0`   | Labels, table headers, muted info      |
| Muted text         | `--text-muted`          | `#A3B1C6`   | Placeholders, disabled states          |
| Border default     | `--border-default`      | `#E8EEF4`   | Card borders, table dividers           |
| Border focus       | `--border-focus`        | `#FF902F`   | Input focus ring                       |
| State success      | `--state-success`       | `#00D68F`   | Active badges, positive KPI            |
| State success bg   | `--state-success-bg`    | `#E6FBF4`   | Success badge background               |
| State warning      | `--state-warning`       | `#FFAA00`   | Pending/warning badges                 |
| State warning bg   | `--state-warning-bg`    | `#FFF8E6`   | Warning badge background               |
| State error        | `--state-error`         | `#FF4C61`   | Error states, destructive actions      |
| State error bg     | `--state-error-bg`      | `#FFEEF0`   | Error badge background                 |
| State info         | `--state-info`          | `#2196F3`   | Info badges, neutral highlights        |
| State info bg      | `--state-info-bg`       | `#E8F4FD`   | Info badge background                  |
| Sidebar bg         | `--sidebar-bg`          | `#1B2E4B`   | Left sidebar fill                      |
| Sidebar text       | `--sidebar-text`        | `#A3BDCC`   | Inactive nav item text                 |
| Sidebar active     | `--sidebar-active`      | `#FFFFFF`   | Active nav item text                   |
| Sidebar active bg  | `--sidebar-active-bg`   | `#FF902F`   | Active nav item pill background        |
| Shadow default     | `--shadow-card`         | `0 2px 8px rgba(27,46,75,0.08)` | Card shadow |

## Typography

| Role          | Font                  | Variable        | Notes                              |
| ------------- | --------------------- | --------------- | ---------------------------------- |
| UI / body     | Circular Std / Nunito | `--font-sans`   | Fallback: `'Nunito', sans-serif`   |
| Mono / code   | JetBrains Mono        | `--font-mono`   | Payslip amounts, IDs               |

Font sizes follow Tailwind's default scale (`text-xs` through `text-2xl`).
Page titles: `text-xl font-semibold`. Section headers: `text-base font-semibold`.
Table headers: `text-xs font-medium uppercase tracking-wide`.

## Border Radius

| Context              | Tailwind Class    | px equivalent |
| -------------------- | ----------------- | ------------- |
| Input / small badge  | `rounded`         | 4px           |
| Button               | `rounded-md`      | 6px           |
| Card / panel         | `rounded-lg`      | 8px           |
| Modal / drawer       | `rounded-xl`      | 12px          |
| Avatar               | `rounded-full`    | 50%           |

## Layout Shell

```
┌─────────────────────────────────────────────────────────┐
│  Topbar (h-16, bg-surface, border-b)                    │
│  [hamburger] [breadcrumb]          [search] [notif] [avatar] │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │  Main Content Area                           │
│ w-64     │  p-6, bg-base                                │
│ fixed    │  PageHeader (title + actions)                │
│ dark bg  │  ─────────────────────────                   │
│          │  Content (cards, tables, grids)              │
│ Nav item │                                              │
│ groups:  │                                              │
│  Main    │                                              │
│  HR      │                                              │
│  Payroll │                                              │
│  Reports │                                              │
└──────────┴──────────────────────────────────────────────┘
```

- **Sidebar**: `w-64` fixed left, `bg-sidebar-bg`, collapses to icon-only (`w-16`) on toggle.
- **Topbar**: `h-16` sticky top, `bg-surface`, `border-b border-default`, `z-30`.
- **Main content**: `ml-64` (or `ml-16` collapsed), `min-h-screen`, `bg-base`, `p-6`.
- **Page header**: row with page title left, action buttons right (e.g. "+ Add Employee").

## Navigation Groups (Sidebar)

```
MAIN
  Dashboard

HR
  Employees
  Departments
  Designations
  Attendance
  Leaves

PAYROLL
  Employee Salary
  Payslip
  Expenses
  Provident Fund

RECRUITMENT
  Jobs
  Candidates
  Referrals

SUPPORT
  Tickets

REPORTS
  All Reports

SETTINGS
  Company Settings
  Roles & Permissions
  Users
```

## Component Patterns

### Stat / KPI Card
- White card, `rounded-lg`, `shadow-card`
- Icon in a coloured circle (tinted bg matching accent colour)
- Large bold number, label below, trend badge (↑/↓ + %)

### Data Table
- Full-width, `bg-surface`, `rounded-lg`, `shadow-card`
- Sticky header row, `bg-surface-alt`, `text-xs uppercase text-secondary`
- Row height `h-14`, `border-b border-default`
- Last column: action icons (eye, edit, delete) in `text-secondary`
- Pagination bar below table

### Page Header
- Row: left = page title + breadcrumb; right = filter dropdown + primary CTA button
- `mb-6`

### Status Badge
- Pill: `rounded-full px-3 py-1 text-xs font-medium`
- Active/Approved → `bg-success-bg text-success`
- Pending → `bg-warning-bg text-warning`
- Inactive/Rejected → `bg-error-bg text-error`
- New/Open → `bg-info-bg text-info`

### Modal
- Centered overlay, `backdrop-blur-sm bg-black/40`
- White card `rounded-xl p-6 shadow-xl max-w-lg w-full`
- Title row + close icon (X)
- Form fields
- Footer: Cancel (outline) + Submit (primary) buttons right-aligned

### Form Fields
- Label above input, `text-sm font-medium text-primary mb-1`
- Input: `h-10 px-3 rounded border border-default bg-surface text-sm`
- Focus: `ring-2 ring-accent-primary border-accent-primary`
- Error: `border-error text-error` + error message below

### Avatar
- Circular image or initials fallback
- Sizes: `h-8 w-8` (table), `h-10 w-10` (list card), `h-16 w-16` (profile)

## Icons

Lucide React, stroke-weight 1.5.
- Inline / table actions: `h-4 w-4`
- Button icons: `h-4 w-4 mr-2`
- Sidebar nav: `h-5 w-5`
- Empty state illustrations: `h-16 w-16 text-muted`
