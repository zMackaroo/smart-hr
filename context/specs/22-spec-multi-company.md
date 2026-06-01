# Spec 22 — Multi-Company Tenancy (Phase 2)

## Goal

Extend SmartHR from single-company (`co-1`) to multi-company SaaS deployment.
Each company has isolated data; Super Admin manages companies; HR Admin and
Employee users belong to exactly one company.

**Phase 2 spec — do not implement until Specs 17–21 are complete.**

Resolves open question in `progress-tracker.md`: *Company multi-tenancy*.

---

## Architecture Decisions

- **`companyId` on all entities** — employees, departments, expenses, tickets, etc.
- **Auth user carries `companyId`** — already present on `AuthUser`; enforce on all API reads/writes.
- **Company switcher** — Super Admin only; selects active company context stored in Zustand `uiStore`.
- **Data isolation** — mock APIs filter by `activeCompanyId`; cross-company access returns 403.
- **Settings per company** — Spec 13 company settings keyed by `companyId`.

---

## Routes

| Path                    | Page              | Role        |
| ----------------------- | ----------------- | ----------- |
| `/settings/companies`   | `CompaniesPage`   | super_admin |

Existing settings move:
- `/settings/company` → current selected company's settings
- Super Admin sees company switcher in topbar

---

## Key Deliverables

1. `companies.api.ts` — CRUD companies (name, slug, status, plan)
2. Company switcher in topbar (super_admin)
3. Migrate all mock stores to filter by `companyId`
4. Seed 2 companies with isolated demo data
5. Register flow creates new company + super_admin user
6. Update Spec 12 reports to scope by company

---

## Out of Scope (Phase 2)

- Billing / subscription plans
- Custom domains per company
- Cross-company employee transfers

---

## Acceptance Criteria

1. Super Admin can create and switch between companies.
2. HR Admin in Company A cannot see Company B employees.
3. All existing modules respect active company context.
4. Company settings isolated per company.
5. `npm run build` passes after implementation.
