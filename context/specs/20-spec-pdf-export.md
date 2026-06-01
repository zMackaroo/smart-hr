# Spec 20 — PDF Export (Payslips & Reports)

## Goal

Add PDF download alongside existing CSV export for payslips and reports. Resolves
the deferred PDF items in Spec 09 (payslip download) and Spec 12 (report export).

**Implementation note:** Use a client-side PDF library (`jspdf` + `jspdf-autotable`
or `@react-pdf/renderer`). No server-side PDF generation in v1. Implement payslip
PDF first (single-page layout), then report PDF (table export).

**Architecture decision:** PDF generation runs in the browser from the same data
already fetched for preview/export. Filename pattern: `{type}-{date}.pdf`. Keep
CSV as default export; PDF as secondary action.

---

## Routes

No new routes. Enhances existing:
- `/payroll/payslip` — Download PDF on admin table, employee cards, detail modal
- `/reports` — Export PDF button in `ReportPreviewModal`

---

## File Structure

```
src/
├── utils/
│   ├── pdf.utils.ts                  ← shared PDF helpers
│   ├── payslip-pdf.utils.ts          ← payslip layout builder
│   └── report-pdf.utils.ts           ← report table builder
└── pages/
    ├── Payroll/components/
    │   └── (update AdminPayslipView, PayslipCard, PayslipPreview download handlers)
    └── Reports/components/
        └── (update ReportPreviewModal footer)
```

Add dependency: `jspdf`, `jspdf-autotable` (or equivalent — document choice in PR).

---

## Payslip PDF Layout

Single A4 page containing:
1. **Header** — Company name (from Spec 13 company settings), pay period, generated date
2. **Employee block** — Name, ID, department, designation
3. **Earnings table** — Label, amount columns
4. **Deductions table** — Label, amount columns
5. **Summary** — Gross, total deductions, PF employee/employer, net pay
6. **Footer** — Status badge text, payment date if paid
7. **Deposit account** — Primary bank mask (Spec 17) if available

### API update (`payroll.api.ts`)

```ts
downloadPayslipPdf(id: string): Promise<Blob>
  // v1: fetch payslip data, build PDF client-side in caller; API returns same PayslipDetail
  // OR utility accepts PayslipDetail directly — no new API endpoint required
```

Prefer **client-only PDF build** from existing `getPayslip(id)` data — no mock Blob from API.

---

## Report PDF Layout

From `ReportData` (Spec 12):
- Title + generated timestamp + applied filters summary
- Auto-table with column headers and rows (paginated across pages if >30 rows)
- Page numbers in footer

### UI update (`ReportPreviewModal`)
- Footer buttons: `[Export CSV]` (existing) + `[Export PDF]` (new)
- Loading state on PDF generation

---

## UI Changes

### Payslip (Admin + Employee)
- Download icon triggers PDF (replace or offer dropdown: CSV | PDF)
- v1 recommendation: **Download** → PDF; keep bulk CSV export on admin toolbar

### Reports
- Add `[Export PDF]` next to CSV in preview modal

---

## Acceptance Criteria

1. Admin can download individual payslip as PDF from table and detail modal.
2. Employee can download own payslip as PDF from card and detail modal.
3. PDF contains earnings, deductions, and net pay matching on-screen preview.
4. Report preview exports current filtered data as PDF table.
5. PDF filenames follow `{payslip|report-type}-YYYY-MM-DD.pdf` pattern.
6. CSV export continues to work unchanged.
7. PDF generation errors show toast notification; no silent failures.
8. `npm run build` passes with zero TypeScript errors after implementation.

---

## Out of Scope

- Branded PDF templates / custom letterhead designer
- Email payslip as PDF attachment
- Password-protected PDFs
