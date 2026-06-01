# Spec 32 — Data Export & API Keys (Phase 3)

## Goal

Enable tenant admins to **export company data** (offboarding, GDPR, backups) and
manage **API keys / webhooks** for integrations. Mock generation defines contracts
for future backend export jobs and public API.

**Phase 3 spec — depends on Spec 22, 22d, Spec 28 (audit).**

---

## Problem

SaaS customers need data portability and integration hooks. Without export and
API key management, SmartHR is a silo. Spec 12 covers filtered CSV reports but
not full tenant bundle export or programmatic access.

---

## Architecture Decisions

- **Export bundle (mock)** — client-side ZIP of CSV files per module (employees,
  departments, leaves, attendance, payroll, etc.) using `JSZip` if already in
  project from Spec 20 PDF work, or sequential CSV downloads in v1 fallback.
- **Async job simulation** — large export shows progress modal → completes in 3s mock.
- **API keys** — generate `sk_live_{random}` stored hashed (mock: store plain with
  `keyPreview` last 4); one active key per company in v1 (rotate = revoke + create).
- **Webhooks** — register HTTPS URL + event subscriptions; mock delivery log.
- **Audit** — `data.exported`, `api_key.created`, `api_key.revoked`, `webhook.delivered`.

---

## Routes

| Path | Page | Role |
| ---- | ---- | ---- |
| `/settings/integrations` | `IntegrationsPage` | super_admin, hr_admin |

Single page with tabs: **Data Export** | **API Keys** | **Webhooks**

---

## File Structure

```
src/
├── pages/
│   └── Settings/
│       ├── IntegrationsPage.tsx
│       ├── IntegrationsPage.viewmodel.ts
│       └── components/
│           ├── DataExportPanel.tsx
│           ├── ExportProgressModal.tsx
│           ├── ApiKeysPanel.tsx
│           ├── CreateApiKeyModal.tsx
│           ├── WebhooksPanel.tsx
│           ├── WebhookFormModal.tsx
│           └── WebhookDeliveryLog.tsx
├── api/
│   ├── data-export.api.ts
│   ├── api-keys.api.ts
│   └── webhooks.api.ts
├── types/
│   └── integration.types.ts
└── utils/
    └── export-bundle.utils.ts
```

---

## Types

```ts
export type ExportModule =
  | 'employees'
  | 'departments'
  | 'designations'
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'expenses'
  | 'tickets'
  | 'projects'
  | 'users'

export const ExportJobSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  modules: z.array(z.string()),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  requestedBy: z.object({ id: z.string(), name: z.string() }),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
  downloadUrl: z.string().optional(),    // mock blob URL
})

export const ApiKeySchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  keyPreview: z.string(),                // ...abcd
  createdAt: z.string(),
  lastUsedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
})

export const WebhookSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string(),
  active: z.boolean(),
  createdAt: z.string(),
})

export const WebhookDeliverySchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  event: z.string(),
  status: z.enum(['success', 'failed']),
  responseCode: z.number(),
  createdAt: z.string(),
})
```

---

## API Functions

### Data export

```ts
requestExport(modules: ExportModule[]): Promise<ExportJob>
getExportJob(id: string): Promise<ExportJob>
downloadExportBundle(jobId: string): Promise<Blob>
```

Implementation gathers data via existing scoped APIs, converts to CSV per module,
bundles into ZIP (or multi-file download fallback).

### API keys

```ts
listApiKeys(companyId?: string): Promise<ApiKey[]>
createApiKey(name: string): Promise<{ key: ApiKey; secret: string }>  // secret shown once
revokeApiKey(id: string): Promise<void>
```

### Webhooks

```ts
listWebhooks(): Promise<Webhook[]>
createWebhook(input: { url: string; events: string[] }): Promise<Webhook>
updateWebhook(id: string, input): Promise<Webhook>
deleteWebhook(id: string): Promise<void>
listWebhookDeliveries(webhookId: string): Promise<WebhookDelivery[]>
testWebhook(id: string): Promise<WebhookDelivery>   // mock POST
```

Event catalogue (checkbox list):
`employee.created`, `leave.approved`, `payroll.processed`, `ticket.created`

---

## UI

### Data Export tab
- Checklist of modules (select all)
- `[Export data]` → progress modal → `[Download ZIP]`
- Warning: "Contains sensitive HR data — handle securely."
- Export history table (last 5 jobs)

### API Keys tab
- Empty state + docs link (mock markdown: "Authorization: Bearer sk_live_...")
- Create key modal: name → on success show full secret once with copy button
- Table: name, preview, created, last used, revoke action

### Webhooks tab
- List webhooks with URL, events, active toggle
- Add webhook modal: URL + event checkboxes
- Delivery log expandable per webhook
- `[Send test event]` button

---

## Acceptance Criteria

1. HR Admin can export selected modules; ZIP/download contains only active company data.
2. Export creates audit log entry (Spec 28).
3. API key created once shows full secret; thereafter only preview.
4. Revoked key cannot be used (mock validation helper for future API middleware).
5. Webhook test creates delivery log entry with mock 200 response.
6. Integrations settings not accessible to employee role.
7. `npm run build` passes.

---

## Out of Scope

- Real REST API endpoints consuming API keys
- OAuth2 client credentials for third-party apps
- Webhook retry backoff / dead letter queue
- Incremental sync / delta exports
- PII redaction profiles
- Customer-owned S3 destination
- Rate limiting per API key

---

## Dependencies

| Spec | Relationship |
| ---- | ------------ |
| **22 / 22d** | Scoped data sources |
| **12 / 20** | CSV export patterns |
| **28** | Audit instrumentation |

---

## Test Plan (manual)

| Step | Action | Expected |
| ---- | ------ | -------- |
| 1 | Export employees + leaves for Acme | ZIP with 2 CSVs, Acme rows only |
| 2 | Create API key | Secret shown once |
| 3 | Add webhook + test | Delivery log success |
| 4 | Audit log | data.exported + api_key.created entries |

---

## Future Backend Contract (documentation only)

```
POST /v1/exports        Authorization: Bearer {api_key}
GET  /v1/exports/:id
POST /v1/webhooks
X-Company-Id: {uuid}    // or derived from API key
```

Include this block in spec for backend team handoff; not implemented in frontend repo.
