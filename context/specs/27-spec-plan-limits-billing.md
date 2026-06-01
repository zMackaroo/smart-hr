# Spec 27 — Plan Limits & Billing UI (Phase 3)

## Goal

Activate the existing `Company.plan` and `Company.status` fields (Spec 22) with
**feature gating**, **seat limits**, and a **billing settings UI**. Monetization
and trial UX are mock-first; Stripe integration deferred to backend.

**Phase 3 spec — depends on Spec 22, 22b.**

---

## Problem

Companies have `plan: starter | professional | enterprise` and `status: active |
suspended` in the data model, but plans do nothing in the UI. SaaS buyers expect
upgrade paths, trial expiry warnings, and module access tied to subscription tier.

---

## Architecture Decisions

### Plan limits config (frontend)

Centralise in `src/config/plan-limits.config.ts`:

```ts
export const PLAN_LIMITS = {
  starter: {
    maxEmployees: 25,
    maxUsers: 5,
    modules: ['employees', 'attendance', 'leaves', 'tickets'],
  },
  professional: {
    maxEmployees: 100,
    maxUsers: 25,
    modules: [/* starter + */ 'payroll', 'recruitment', 'expenses', 'reports', 'projects'],
  },
  enterprise: {
    maxEmployees: Infinity,
    maxUsers: Infinity,
    modules: ['*'],  // all modules
  },
} as const
```

### Enforcement hooks

- `usePlanLimits()` — returns `{ plan, limits, canAccessModule, isAtSeatLimit, isAtEmployeeLimit }`
- `PlanGate` component — wraps nav items and routes; shows upgrade prompt modal
- Create employee/user — block with toast when at limit (starter/professional)

### Trial & billing status

Extend `Company`:

```ts
trialEndsAt: z.string().nullable().optional()
billingEmail: z.string().email().optional()
subscriptionStatus: z.enum(['trialing', 'active', 'past_due', 'cancelled']).optional()
```

Mock: new register sets `trialing` + `trialEndsAt` = now + 14 days.

### Billing UI (mock)

No real payment processing. "Upgrade" opens plan comparison modal → confirm →
updates `company.plan` via API + success toast.

---

## Routes

| Path | Page | Role |
| ---- | ---- | ---- |
| `/settings/billing` | `BillingPage` | super_admin, hr_admin |

Platform Super Admin can view any company's plan on `CompaniesPage` (existing)
with link to tenant billing (read-only on platform host).

---

## File Structure

```
src/
├── config/
│   └── plan-limits.config.ts
├── hooks/
│   └── usePlanLimits.ts
├── components/
│   └── billing/
│       ├── PlanComparisonModal.tsx
│       ├── PlanBadge.tsx
│       ├── TrialBanner.tsx
│       ├── UsageMeter.tsx
│       └── UpgradePrompt.tsx
├── pages/
│   └── Settings/
│       ├── BillingPage.tsx
│       └── BillingPage.viewmodel.ts
├── api/
│   └── billing.api.ts
└── types/
    └── billing.types.ts
```

---

## API Functions

```ts
getBillingSummary(companyId?: string): Promise<BillingSummary>
changePlan(plan: CompanyPlan): Promise<Company>        // mock upgrade/downgrade
updateBillingEmail(email: string): Promise<Company>
getUsageStats(companyId?: string): Promise<UsageStats> // employee count, user count
```

`BillingSummary` includes current plan, usage vs limits, trial days remaining,
subscription status.

---

## UI — Billing Page

### Current plan card
- Plan name badge, price (static marketing copy), renewal date (mock)
- Usage meters: Employees `18/25`, Users `4/5`

### Trial banner (global)
- Shown in app shell when `trialing` and ≤7 days left
- `[Upgrade now]` → Billing page

### Plan comparison
- Three-column table: Starter / Professional / Enterprise
- Feature checkmarks per module
- `[Upgrade]` / `[Downgrade]` (downgrade confirm warns about data access loss)

### Past due / suspended
- `past_due` — amber banner, modules read-only except billing
- `suspended` (existing Spec 22b) — login blocked with contact support message

---

## Nav & Route Integration

- `navigation.config.ts` — filter items through `canAccessModule()`
- Existing `RoleGuard` unchanged; add `PlanGate` alongside for gated modules
- Dashboard shows upgrade CTA card for starter plans

---

## Acceptance Criteria

1. Starter company cannot access Payroll nav item (hidden or locked with upgrade prompt).
2. Creating employee #26 on starter plan shows limit error.
3. Billing page shows accurate usage counts from mock stores.
4. Mock upgrade starter → professional unlocks gated modules immediately.
5. Trial banner appears when `trialEndsAt` within 7 days.
6. New register company starts on `starter` + 14-day trial (configurable constant).
7. `npm run build` passes.

---

## Out of Scope

- Stripe Checkout / Customer Portal
- Proration, invoices, tax, payment methods
- Usage-based metering (API calls, storage)
- Annual vs monthly toggle with real pricing
- Email receipts

---

## Dependencies

| Spec | Relationship |
| ---- | ------------ |
| **22** | `plan`, `status` on Company |
| **19** | Permission modules list for gating |
| **25** | Optional trial start on register |

---

## Test Plan (manual)

| Step | Action | Expected |
| ---- | ------ | -------- |
| 1 | Set Acme to starter in Companies CRUD | Payroll hidden for Acme admin |
| 2 | Billing → Upgrade to professional | Payroll visible |
| 3 | Seed 25 employees on starter | 26th create blocked |
| 4 | Set trialEndsAt to tomorrow | Trial banner on dashboard |
