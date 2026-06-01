# Spec 13 — Company Settings

## Goal

Build the Company Settings page where a Super Admin configures organisation-wide
profile, regional preferences, and HR defaults. This is a single-company settings
surface in v1 (one `companyId` per deployment). Changes persist in the mock API
store and are reflected across modules that display company name, currency, or
timezone.

**Implementation note:** Implement as one session. No sub-routes. Update sidebar
nav href from `/settings` to `/settings/company`.

**Architecture decision:** Company settings are read by mock APIs (payroll currency
labels, report headers, auth register default company name). The settings API is
the single source of truth — do not duplicate company fields in other stores.

---

## Routes

| Path                 | Page                  | Role          |
| -------------------- | --------------------- | ------------- |
| `/settings/company`  | `CompanySettingsPage` | super_admin   |

Wrap in `RoleGuard` in `routes.tsx`. `hr_admin` and `employee` cannot access.

---

## File Structure

```
src/
├── pages/
│   └── Settings/
│       ├── CompanySettingsPage.tsx
│       ├── CompanySettingsPage.viewmodel.ts
│       └── components/
│           ├── CompanyProfileSection.tsx
│           ├── RegionalPreferencesSection.tsx
│           ├── HrDefaultsSection.tsx
│           └── NotificationPreferencesSection.tsx
├── api/
│   └── company.api.ts
└── types/
    └── company.types.ts
```

Reuse existing `SettingsPage.tsx` stub only if replaced — prefer dedicated page file.

---

## Zod Schemas & Types (`company.types.ts`)

```ts
export type WorkWeek = 'mon_fri' | 'mon_sat' | 'custom'
export type DateFormat = 'MDY' | 'DMY' | 'YMD'
export type TimeFormat = '12h' | '24h'

export const CompanySettingsSchema = z.object({
  id: z.string(),
  name: z.string(),
  legalName: z.string().optional(),
  logoUrl: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string().optional(),
    postalCode: z.string(),
    country: z.string(),
  }),
  timezone: z.string(),              // IANA, e.g. "America/New_York"
  currency: z.string().default('USD'),
  dateFormat: z.enum(['MDY', 'DMY', 'YMD']),
  timeFormat: z.enum(['12h', '24h']),
  fiscalYearStartMonth: z.number().min(1).max(12),
  workWeek: z.enum(['mon_fri', 'mon_sat', 'custom']),
  standardWorkHours: z.number().min(1).max(24),
  defaultProbationDays: z.number().min(0),
  notifications: z.object({
    leaveRequests: z.boolean(),
    expenseClaims: z.boolean(),
    ticketUpdates: z.boolean(),
    payrollProcessed: z.boolean(),
  }),
  updatedAt: z.string(),
  updatedBy: z.object({ id: z.string(), name: z.string() }),
})

export const CompanySettingsFormSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  legalName: z.string().optional(),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().min(1, 'Currency is required'),
  dateFormat: z.enum(['MDY', 'DMY', 'YMD']),
  timeFormat: z.enum(['12h', '24h']),
  fiscalYearStartMonth: z.number().min(1).max(12),
  workWeek: z.enum(['mon_fri', 'mon_sat', 'custom']),
  standardWorkHours: z.number().min(1).max(24),
  defaultProbationDays: z.number().min(0),
  notificationsLeaveRequests: z.boolean(),
  notificationsExpenseClaims: z.boolean(),
  notificationsTicketUpdates: z.boolean(),
  notificationsPayrollProcessed: z.boolean(),
})
```

---

## API Functions (`company.api.ts`)

```ts
getCompanySettings(): Promise<CompanySettings>
  GET /api/company/settings

updateCompanySettings(data: CompanySettingsFormInput): Promise<CompanySettings>
  PUT /api/company/settings

uploadCompanyLogo(file: File): Promise<{ logoUrl: string }>
  POST /api/company/logo   // mock: returns placeholder URL
```

**Mock data notes:**
- Seed one company record (`co-1`, "SmartHR Inc.") aligned with auth mock `companyId`.
- Default timezone `America/New_York`, currency `USD`, fiscal year start month `1`.
- Logo upload returns a mock blob URL or static asset path — no real file storage.

---

## UI Notes

Follow patterns in `ui-context.md`:
- Page uses stacked **section cards** (`rounded-lg border bg-surface shadow-card p-6`).
- Single-page form split into four sections with `Save Changes` per section OR one
  global save at page footer (prefer **one Save** at bottom for v1 simplicity).
- Unsaved-changes guard: warn on navigate away if form is dirty (optional v1).
- Currency/timezone use searchable `<select>` or plain select with common options.
- Logo upload uses existing avatar/file picker pattern (mock accept `image/*`).

---

## Page UI

### Page Header
- Title: "Company Settings"
- Breadcrumbs: `[Settings] → [Company Settings]`

### Section 1 — Company Profile (`CompanyProfileSection`)
Fields:
- Company Name (required)
- Legal Name (optional)
- Company Email (required)
- Phone (optional)
- Website (optional)
- Logo upload (preview + Replace / Remove)
- Address: Line 1, Line 2, City, State, Postal Code, Country

### Section 2 — Regional Preferences (`RegionalPreferencesSection`)
Fields:
- Timezone (select)
- Currency (select: USD, EUR, GBP, INR, etc.)
- Date Format (select)
- Time Format (12h / 24h)
- Fiscal Year Start Month (select 1–12)

### Section 3 — HR Defaults (`HrDefaultsSection`)
Fields:
- Work Week (Mon–Fri / Mon–Sat / Custom)
- Standard Work Hours per day (number)
- Default Probation Period (days)

### Section 4 — Notification Preferences (`NotificationPreferencesSection`)
Toggle rows (label + description + switch):
- Leave request notifications
- Expense claim notifications
- Ticket update notifications
- Payroll processed notifications

### Page Footer
- `[Save Changes]` primary button (disabled when pristine or submitting)
- Success toast on save via `notificationStore`

### Loading / Error
- Skeleton cards while fetching
- Inline error banner with retry if fetch fails

---

## ViewModel Hook

### `useCompanySettingsPageViewModel`
```ts
returns {
  settings: CompanySettings | undefined
  isLoading: boolean
  isSubmitting: boolean
  form: UseFormReturn<CompanySettingsFormInput>
  onSubmit: (data: CompanySettingsFormInput) => void
  onLogoUpload: (file: File) => void
  onLogoRemove: () => void
}
```

---

## Route Guards & Nav

- Add route `/settings/company` wrapped in `RoleGuard roles={['super_admin']}`.
- Update `navigation.config.ts`: Company Settings href → `/settings/company`.
- Redirect `/settings` → `/settings/company` for super_admin.

---

## Acceptance Criteria

1. Super Admin can view current company settings loaded from mock API.
2. Super Admin can update all form fields and save successfully.
3. Saved settings persist across page refresh (mock store).
4. Logo upload shows preview; remove clears logo URL.
5. Non–super-admin users cannot access `/settings/company` (redirect or 403 route guard).
6. Form validation errors display inline per field.
7. Loading skeleton and empty/error states render appropriately.
8. `npm run build` passes with zero TypeScript errors after implementation.
