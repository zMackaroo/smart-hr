# Spec 22c — Custom Domains (Phase 3)

## Goal

Allow enterprise tenants to map a **custom hostname** (e.g. `hr.acme.com`) to
their SmartHR workspace instead of `{slug}.smarthr.com`. Frontend implements
domain registration UI, verification status, and hostname resolution in dev;
real DNS/TLS provisioning remains backend/infra.

**Phase 3 spec — depends on Spec 22b (subdomain tenancy).**

---

## Problem

Spec 22b routes tenants via `{slug}.smarthr.com`. Enterprise buyers often require
a branded URL on their own domain. Without custom domain support, SmartHR looks
like a sub-product rather than part of the customer's IT stack.

---

## Architecture Decisions

### Domain model

Each company may have **one primary custom domain** (v1 simplification):

```ts
export type CustomDomainStatus =
  | 'none'           // using default {slug}.smarthr.com
  | 'pending'        // awaiting DNS verification
  | 'verified'       // active — resolves tenant
  | 'failed'         // verification timed out / misconfigured

export const CustomDomainSchema = z.object({
  hostname: z.string(),                    // hr.acme.com
  status: z.enum(['pending', 'verified', 'failed']),
  verificationToken: z.string(),             // TXT record value
  verifiedAt: z.string().optional(),
  createdAt: z.string(),
})
```

Store on `Company` as optional `customDomain: CustomDomain | null`.

### Hostname resolution (extend Spec 22b)

Update `resolveTenantFromHost()` priority:

1. Exact match on `company.customDomain.hostname` where `status === 'verified'`
2. Subdomain slug match (`acme.smarthr.com`)
3. Dev overrides (`?tenant=`, platform host)

Reserved: do not allow custom domains that collide with platform host or
reserved slugs.

### Frontend-only verification (mock)

- Admin enters hostname → API returns `pending` + TXT token
- `[Verify DNS]` button simulates check (random success after 2s or manual
  "Mark verified" dev toggle)
- On `verified`, login page accessible at custom hostname in dev via
  `?domain=hr.acme.com` query override (no real DNS in repo)

Production notes: CNAME to `{slug}.smarthr.com`, ACME TLS, webhook from DNS
provider — documented, not implemented.

---

## Routes

| Path | Page | Role |
| ---- | ---- | ---- |
| `/settings/domain` | `CustomDomainPage` | super_admin, hr_admin |

Add under Settings nav: **Custom Domain** (tenant hosts only; hidden on platform
Super Admin global view unless viewing a company's settings context).

---

## File Structure

```
src/
├── pages/
│   └── Settings/
│       ├── CustomDomainPage.tsx
│       ├── CustomDomainPage.viewmodel.ts
│       └── components/
│           ├── DomainStatusBadge.tsx
│           ├── DomainSetupInstructions.tsx
│           └── DomainVerifyPanel.tsx
├── api/
│   └── custom-domains.api.ts
├── types/
│   └── custom-domain.types.ts
├── utils/
│   └── tenant.utils.ts                 ← extend resolveTenantFromHost()
└── config/
    └── tenant.config.ts                ← dev ?domain= override
```

---

## API Functions (`custom-domains.api.ts`)

```ts
getCustomDomain(companyId?: string): Promise<CustomDomain | null>
requestCustomDomain(hostname: string): Promise<CustomDomain>
verifyCustomDomain(): Promise<CustomDomain>   // mock DNS check
removeCustomDomain(): Promise<void>
```

Validation:
- Hostname must be FQDN (no path, no port)
- Cannot equal platform host or existing verified domain of another company
- Normalise to lowercase

---

## UI — Custom Domain Page

### Empty state
- Explains default URL: `{slug}.{platformHost}`
- `[Add Custom Domain]` opens hostname input

### Pending state
- DNS instructions card:
  - **Type:** TXT (verification) + CNAME (routing — informational)
  - **Host / Value:** copy buttons
- `[Verify DNS]` primary button
- `[Remove domain]` destructive (disabled while verifying)

### Verified state
- Green badge: "Active — hr.acme.com"
- Show effective login URL
- `[Remove domain]` with confirm modal

### Failed state
- Error message + retry verify + remove

---

## Acceptance Criteria

1. HR Admin can register a custom domain hostname for their company.
2. Pending domain shows TXT verification instructions with copy-to-clipboard.
3. Mock verify transitions `pending` → `verified`.
4. Dev `?domain=hr.acme.com` resolves tenant same as `?tenant=acme`.
5. Two companies cannot claim the same hostname.
6. Removing domain reverts to subdomain-only URL.
7. `npm run build` passes.

---

## Out of Scope

- Automatic DNS provisioning (Route53, Cloudflare API)
- SSL certificate issuance and renewal
- Multiple custom domains per company
- Email MX records / white-label email (Spec 31)
- Wildcard certificates

---

## Dependencies

| Spec | Relationship |
| ---- | ------------ |
| **22b** | Required — hostname resolution |
| **22d** | Recommended — isolation before exposing custom URLs |

---

## Test Plan (manual)

| Step | Action | Expected |
| ---- | ------ | -------- |
| 1 | Acme admin → Settings → Custom Domain | Empty state |
| 2 | Add `hr.acme.com` | Pending + TXT shown |
| 3 | Verify DNS | Status verified |
| 4 | Open login with `?domain=hr.acme.com` | Acme branding |
| 5 | SmartHR admin tries same hostname | Validation error |
