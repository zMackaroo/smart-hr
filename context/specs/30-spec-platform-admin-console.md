# Spec 30 — Platform Admin Console (Phase 3)

## Goal

Give **SmartHR platform operators** (Super Admin on platform host) a dedicated
console to manage all tenants: view usage, suspend/reactivate companies, and
impersonate tenant admins for support — without mixing operator tools into
tenant day-to-day HRIS UI.

**Phase 3 spec — depends on Spec 22, 22b, Spec 27 (usage stats).**

---

## Problem

Spec 22 `CompaniesPage` lists companies but lacks operator workflows: no at-a-glance
health, no impersonation for support, no cross-tenant metrics. Super Admin uses
the same sidebar as HR admins, which is confusing on `app.` platform host.

---

## Architecture Decisions

- **Platform host only** — routes under `/platform/*` accessible when
  `isPlatformHost()` && user.role === `super_admin`.
- **Impersonation (mock)** — sets `uiStore.impersonation: { companyId, adminUserId,
  startedAt }`; banner "Viewing as Acme Admin — Exit"; redirects to tenant URL
  with `?tenant=` override; exit clears impersonation.
- **Read-heavy dashboard** — aggregate counts from existing APIs; no new stores
  except optional `platform-metrics.api.ts` cache.
- **Tenant actions** — suspend/reactivate reuse `companies.api` status field;
  audit via Spec 28 `recordAudit` with `platform.*` actions.

---

## Routes

| Path | Page | Role | Host |
| ---- | ---- | ---- | ---- |
| `/platform` | `PlatformDashboardPage` | super_admin | platform |
| `/platform/companies` | `PlatformCompaniesPage` | super_admin | platform |
| `/platform/companies/:id` | `PlatformCompanyDetailPage` | super_admin | platform |

Existing `/settings/companies` may redirect to `/platform/companies` on platform
host or remain as alias.

---

## File Structure

```
src/
├── pages/
│   └── Platform/
│       ├── PlatformDashboardPage.tsx
│       ├── PlatformDashboardPage.viewmodel.ts
│       ├── PlatformCompaniesPage.tsx
│       ├── PlatformCompaniesPage.viewmodel.ts
│       ├── PlatformCompanyDetailPage.tsx
│       ├── PlatformCompanyDetailPage.viewmodel.ts
│       └── components/
│           ├── PlatformStatsCard.tsx
│           ├── TenantHealthTable.tsx
│           ├── ImpersonateButton.tsx
│           ├── ImpersonationBanner.tsx
│           └── CompanyStatusActions.tsx
├── api/
│   └── platform.api.ts
├── types/
│   └── platform.types.ts
└── store/
    └── uiStore.ts                     ← impersonation state
```

---

## Types

```ts
export const PlatformMetricsSchema = z.object({
  totalCompanies: z.number(),
  activeCompanies: z.number(),
  trialingCompanies: z.number(),
  suspendedCompanies: z.number(),
  totalEmployees: z.number(),
  totalUsers: z.number(),
})

export const TenantSummarySchema = z.object({
  company: CompanySchema,
  employeeCount: z.number(),
  userCount: z.number(),
  lastActivityAt: z.string().nullable(),  // from audit log Spec 28
  plan: z.string(),
  subscriptionStatus: z.string().optional(),
})
```

---

## API Functions

```ts
getPlatformMetrics(): Promise<PlatformMetrics>
getTenantSummaries(params?: { search?: string; status?: CompanyStatus; plan?: CompanyPlan }): Promise<TenantSummary[]>
getTenantDetail(companyId: string): Promise<TenantSummary & { recentAudit: AuditEntry[] }>
suspendCompany(companyId: string, reason?: string): Promise<Company>
reactivateCompany(companyId: string): Promise<Company>
startImpersonation(companyId: string): Promise<{ redirectUrl: string; user: AuthUser }>
endImpersonation(): Promise<void>
```

Impersonation picks first `hr_admin` of target company (mock); real backend would
issue limited token.

---

## UI

### Platform Dashboard (`/platform`)
- KPI cards: Total tenants, Active trials, MRR placeholder (static), Total employees
- Table: Recent signups (last 5 companies by `createdAt`)
- Quick links: Manage companies

### Platform Companies (`/platform/companies`)
- Enhanced table vs Spec 22: employees, users, plan, status, last activity
- Filters: status, plan, search by name/slug
- Row actions: View, Suspend, Impersonate

### Company Detail (`/platform/companies/:id`)
- Company metadata + usage meters (Spec 27)
- Recent audit entries (last 10)
- Actions: Suspend/Reactivate, Impersonate, Open tenant (`{slug}.` link)

### Impersonation Banner
- Fixed top banner when impersonating (all routes)
- `[Exit impersonation]` → platform dashboard

### Nav (platform host)
- Super Admin sidebar section: **Platform** → Dashboard, Companies
- Hide tenant HR modules until impersonating OR use separate minimal platform shell

**Recommended:** On platform host without impersonation, show slim nav (Platform +
Settings/Users/Roles only). Full HRIS nav appears during impersonation.

---

## Acceptance Criteria

1. Super Admin on `localhost:5173` (platform) sees Platform dashboard link.
2. Platform companies table shows accurate employee/user counts per tenant.
3. Suspend company → tenant login shows suspended message (Spec 22b).
4. Impersonate Acme → lands on Acme dashboard with banner; data is Acme-scoped.
5. Exit impersonation returns to platform dashboard.
6. HR Admin on tenant host never sees `/platform` routes (403 redirect).
7. Impersonation and suspend actions write audit entries.
8. `npm run build` passes.

---

## Out of Scope

- Real support ticketing integration
- Billing revenue dashboard (Stripe MRR)
- Multi-operator roles (support agent vs billing admin)
- Permanent audit of impersonation sessions on tenant side (banner only in v1)
- Automated anomaly detection

---

## Dependencies

| Spec | Relationship |
| ---- | ------------ |
| **22 / 22b** | Companies, platform vs tenant hosts |
| **27** | Plan and usage stats |
| **28** | Audit log for actions and last activity |

---

## Test Plan (manual)

| Step | Action | Expected |
| ---- | ------ | -------- |
| 1 | super@smarthr.com on platform → /platform | Metrics dashboard |
| 2 | Suspend Acme | acme login blocked |
| 3 | Impersonate Acme | Acme data, banner shown |
| 4 | admin@acme.com direct | No /platform access |
