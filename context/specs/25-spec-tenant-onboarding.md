# Spec 25 — Tenant Onboarding Wizard (Phase 3)

## Goal

Guide new companies from **registration** to a usable HRIS workspace through a
multi-step onboarding wizard. Reduces time-to-value for self-serve SaaS signups
and ensures minimum configuration before entering the main app.

**Phase 3 spec — depends on Spec 22, 22b, and 22d.**

---

## Problem

Spec 22 register flow creates a company + admin user and redirects to tenant login.
After first login, admins land on an empty dashboard with no departments, leave
types, or employees — poor first-run experience for a paying customer.

---

## Architecture Decisions

- **Wizard is skippable** — each step has "Skip for now" except company profile
  (step 1). Progress persisted in `onboardingStore` (Zustand + localStorage keyed
  by `companyId`).
- **Completion flag** — `Company.onboardingCompletedAt: string | null` on company
  record; incomplete onboarding shows banner + `/onboarding` redirect for
  `super_admin` / `hr_admin` on tenant host.
- **Reuses existing APIs** — wizard calls `company.api`, `departments.api`,
  `designations.api`, `leaves.api`, `users.api`; no duplicate stores.
- **Platform host** — onboarding runs on tenant subdomain after first login, not
  on `app.` register page.

---

## Routes

| Path | Page | Role | Host |
| ---- | ---- | ---- | ---- |
| `/onboarding` | `OnboardingWizardPage` | super_admin, hr_admin | tenant |
| `/onboarding/:step` | same (step deep-link) | super_admin, hr_admin | tenant |

Guard: if `onboardingCompletedAt` is set, redirect `/onboarding` → `/dashboard`.

Steps (URL slugs):

1. `/onboarding/profile` — Company name, timezone, currency (pre-filled from register)
2. `/onboarding/structure` — Add 1+ departments + designations
3. `/onboarding/leave` — Confirm default leave types (Annual, Sick, Casual) or customise
4. `/onboarding/team` — Invite first HR admin / employees (links to Spec 26 inline or simplified invite)
5. `/onboarding/complete` — Summary + "Go to dashboard"

---

## File Structure

```
src/
├── pages/
│   └── Onboarding/
│       ├── OnboardingWizardPage.tsx
│       ├── OnboardingWizardPage.viewmodel.ts
│       └── components/
│           ├── OnboardingStepper.tsx
│           ├── ProfileStep.tsx
│           ├── StructureStep.tsx
│           ├── LeaveStep.tsx
│           ├── TeamStep.tsx
│           └── CompleteStep.tsx
├── store/
│   └── onboardingStore.ts
├── api/
│   └── onboarding.api.ts              ← markComplete(), getStatus()
└── types/
    └── onboarding.types.ts
```

---

## Types

```ts
export type OnboardingStep =
  | 'profile'
  | 'structure'
  | 'leave'
  | 'team'
  | 'complete'

export const OnboardingStatusSchema = z.object({
  companyId: z.string(),
  currentStep: z.enum(['profile', 'structure', 'leave', 'team', 'complete']),
  completedSteps: z.array(z.string()),
  skippedSteps: z.array(z.string()),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
})
```

Extend `CompanySchema` with `onboardingCompletedAt: z.string().nullable().optional()`.

---

## API Functions

```ts
getOnboardingStatus(companyId?: string): Promise<OnboardingStatus>
updateOnboardingStep(step: OnboardingStep, action: 'complete' | 'skip'): Promise<OnboardingStatus>
completeOnboarding(): Promise<Company>   // sets onboardingCompletedAt
```

Register flow (`auth.api.ts`): after `createCompany`, set `onboardingCompletedAt: null`.

---

## UI

### Shell
- Full-width layout **without** main sidebar (minimal header with company logo)
- Horizontal stepper: Profile → Structure → Leave → Team → Done
- Footer: `[Back]` `[Skip for now]` `[Continue]`

### Step details

**Profile** — subset of Spec 13 company settings (name, timezone, currency, work week)

**Structure** — inline add department + designation rows (min 1 department to continue without skip)

**Leave** — checklist of 3 default types with editable names/days; `[Add leave type]` optional

**Team** — up to 5 email invite fields OR link "Import CSV later" → dashboard

**Complete** — checklist of what was configured; `[Go to Dashboard]` marks complete

### Post-complete
- Dismissible dashboard banner: "Welcome! Finish setting up payroll →" (links to payroll settings) for 7 days mock

---

## Acceptance Criteria

1. New register → first login redirects to `/onboarding/profile`.
2. Admin can complete all steps; dashboard accessible after complete.
3. Skip on structure/leave/team still allows completion.
4. Returning admin with completed onboarding never sees wizard (unless reset in dev).
5. Onboarding state isolated per company (Acme progress ≠ SmartHR).
6. Wizard uses existing CRUD APIs; created data visible in respective modules.
7. `npm run build` passes.

---

## Out of Scope

- Full CSV import (Spec 26 — link only)
- Billing / plan selection during onboarding (Spec 27)
- Interactive product tour overlays
- Employee self-onboarding portal

---

## Dependencies

| Spec | Relationship |
| ---- | ------------ |
| **22 / 22b** | Register + tenant host |
| **22d** | Recommended — clean tenant scoping |
| **26** | Optional enhancement for Team step |

---

## Test Plan (manual)

| Step | Action | Expected |
| ---- | ------ | -------- |
| 1 | Register new company on platform | Redirect to tenant login |
| 2 | First login as new admin | `/onboarding/profile` |
| 3 | Complete wizard | Dashboard with seeded structure |
| 4 | Log out / log in again | Dashboard directly, no wizard |
