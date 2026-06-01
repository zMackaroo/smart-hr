# Spec 31 — Security & SSO Settings (Phase 3)

## Goal

Provide per-tenant **security policy** settings and a **mock SSO configuration**
UI for enterprise buyers. Frontend stores policies and simulates enforcement;
real SAML/OIDC and session management remain backend work.

**Phase 3 spec — depends on Spec 02 (Auth), Spec 22, Spec 15 (Users).**

---

## Problem

Spec 02 implements simulated 2FA and password reset, but there is no tenant-level
control over password rules, MFA enforcement, or SSO. Enterprise RFPs require
"SAML 2.0", "enforce MFA for admins", and "session timeout" checkboxes even
before backend exists.

---

## Architecture Decisions

- **Security settings per company** — stored in `securitySettingsStore` keyed by
  `companyId` (or nested on company settings).
- **Client-side enforcement (mock)** — login and user create validate against policy;
  real enforcement moves to auth service later.
- **SSO mock** — configure IdP metadata URL + domains; `[Test connection]` simulates
  success; login page shows `[Sign in with SSO]` when enabled (mock redirect flow).
- **Super Admin only** for SSO; HR Admin can edit password/MFA policy if permitted
  by permission module `settings.security`.

Add permission module: `settings` sub-key `security` OR extend Spec 19 with
`security` under settings.

---

## Routes

| Path | Page | Role |
| ---- | ---- | ---- |
| `/settings/security` | `SecuritySettingsPage` | super_admin, hr_admin |

---

## File Structure

```
src/
├── pages/
│   └── Settings/
│       ├── SecuritySettingsPage.tsx
│       ├── SecuritySettingsPage.viewmodel.ts
│       └── components/
│           ├── PasswordPolicySection.tsx
│           ├── MfaPolicySection.tsx
│           ├── SessionPolicySection.tsx
│           ├── SsoConfigSection.tsx
│           └── SsoTestResultBanner.tsx
├── api/
│   └── security.api.ts
├── types/
│   └── security.types.ts
└── pages/Auth/
    └── LoginPage.tsx                  ← SSO button + policy hints
```

---

## Types

```ts
export const PasswordPolicySchema = z.object({
  minLength: z.number().min(8).max(128),
  requireUppercase: z.boolean(),
  requireNumber: z.boolean(),
  requireSpecialChar: z.boolean(),
  maxAgeDays: z.number().nullable(),     // null = no expiry
})

export const MfaPolicySchema = z.object({
  requiredForAdmins: z.boolean(),
  requiredForAll: z.boolean(),
  allowedMethods: z.array(z.enum(['totp', 'email'])),
})

export const SessionPolicySchema = z.object({
  idleTimeoutMinutes: z.number().min(15).max(10080),
  maxSessionHours: z.number().min(1).max(720),
})

export const SsoConfigSchema = z.object({
  enabled: z.boolean(),
  provider: z.enum(['saml', 'oidc']).nullable(),
  idpMetadataUrl: z.string().url().optional().or(z.literal('')),
  emailDomains: z.array(z.string()),     // e.g. ['acme.com'] → SSO required
  enforceSso: z.boolean(),               // disable password login for matching domains
  lastTestedAt: z.string().nullable(),
  lastTestStatus: z.enum(['success', 'failed']).nullable(),
})

export const SecuritySettingsSchema = z.object({
  companyId: z.string(),
  password: PasswordPolicySchema,
  mfa: MfaPolicySchema,
  session: SessionPolicySchema,
  sso: SsoConfigSchema,
  updatedAt: z.string(),
})
```

Default settings: sensible defaults per company on create (register / Spec 25).

---

## API Functions

```ts
getSecuritySettings(companyId?: string): Promise<SecuritySettings>
updateSecuritySettings(input: Partial<SecuritySettingsFormInput>): Promise<SecuritySettings>
testSsoConnection(): Promise<{ status: 'success' | 'failed'; message: string }>
validatePasswordAgainstPolicy(password: string, companyId?: string): Promise<{ valid: boolean; errors: string[] }>
```

Update `auth.api.ts`:
- `login()` — if user email domain matches `enforceSso`, reject password login with
  message "Use SSO to sign in"
- `loginWithSso()` (mock) — accepts email → returns token if SSO enabled

---

## UI — Security Settings Page

### Section 1 — Password policy
- Min length slider/input
- Character requirement toggles
- Max password age (days, 0 = never)

### Section 2 — MFA
- Require MFA for admins / all users
- Allowed methods checkboxes

### Section 3 — Session
- Idle timeout (minutes)
- Max session duration (hours)
- Info: "Mock — session timer not enforced in frontend-only mode"

### Section 4 — SSO (enterprise badge)
- Enable SSO toggle
- Provider select: SAML / OIDC
- IdP metadata URL input
- Email domains (tag input)
- Enforce SSO toggle
- `[Test connection]` → mock delay → success/fail banner
- Setup guide collapsible (SP entity ID, ACS URL — static mock URLs)

### Footer
- `[Save changes]` with validation

---

## Login Page Changes

When SSO enabled for resolved tenant:
- Show `[Continue with SSO]` button above password form
- If `enforceSso` and email domain matches → hide password fields after email blur

Mock SSO flow: click SSO → spinner → auto-login as matching domain admin (dev only).

---

## Acceptance Criteria

1. HR Admin can view and save password/MFA/session settings for their company.
2. Register / create company gets default security settings.
3. Password validation on register/reset respects tenant policy (when tenant known).
4. SSO section saves config; test connection updates lastTestStatus.
5. Login on Acme with SSO enforced for `@acme.com` blocks password login.
6. Mock SSO button completes login for demo.
7. Settings isolated per company.
8. `npm run build` passes.

---

## Out of Scope

- Real SAML assertion parsing / OIDC token exchange
- SCIM user provisioning
- Hardware security keys (WebAuthn)
- IP allowlist / geo blocking
- White-label email for MFA codes (Spec 22b)
- Cross-subdomain SSO session (Spec 22b out of scope)

---

## Dependencies

| Spec | Relationship |
| ---- | ------------ |
| **02** | Auth flows |
| **22 / 22b** | Tenant context on login |
| **28** | Audit settings.updated, sso.test |

---

## Test Plan (manual)

| Step | Action | Expected |
| ---- | ------ | -------- |
| 1 | Set min password length 12 for Acme | Register weak password rejected |
| 2 | Enable SSO + enforce for acme.com | admin@acme.com password login blocked |
| 3 | Mock SSO login | Successful session |
| 4 | SmartHR security settings | Independent from Acme |
