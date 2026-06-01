# Spec 10 — Recruitment (Jobs, Candidates, Referrals)

## Goal

Build the Recruitment module covering job postings, candidate pipeline management,
and employee referrals. Admins create and manage jobs, track candidates through
the hiring pipeline, and review referrals submitted by employees.

**Implementation note:** Implement as three separate sessions in this order:
(1) Jobs, (2) Candidates, (3) Referrals. Jobs must exist before Candidates can
be linked to a job opening.

---

## Routes

| Path                        | Page              | Role                              |
| --------------------------- | ----------------- | --------------------------------- |
| `/recruitment/jobs`         | `JobsPage`        | hr_admin, super_admin             |
| `/recruitment/candidates`   | `CandidatesPage`  | hr_admin, super_admin             |
| `/recruitment/referrals`    | `ReferralsPage`   | hr_admin, super_admin, employee   |

`ReferralsPage` renders `<AdminReferralsView>` or `<EmployeeReferralsView>` based
on role.

---

## File Structure

```
src/
├── pages/
│   └── Recruitment/
│       ├── JobsPage.tsx
│       ├── JobsPage.viewmodel.ts
│       ├── CandidatesPage.tsx
│       ├── CandidatesPage.viewmodel.ts
│       ├── ReferralsPage.tsx
│       ├── ReferralsPage.viewmodel.ts
│       └── components/
│           ├── JobCard.tsx
│           ├── JobFormModal.tsx
│           ├── DeleteJobModal.tsx
│           ├── JobFilters.tsx
│           ├── CandidateCard.tsx
│           ├── CandidateFormModal.tsx
│           ├── CandidateDetailModal.tsx
│           ├── CandidateFilters.tsx
│           ├── CandidateStatusBadge.tsx
│           ├── AdminReferralsView.tsx
│           ├── AdminReferralsView.viewmodel.ts
│           ├── EmployeeReferralsView.tsx
│           ├── EmployeeReferralsView.viewmodel.ts
│           ├── ReferralFormModal.tsx
│           └── ReferralStatusBadge.tsx
├── api/
│   └── recruitment.api.ts
└── types/
    └── recruitment.types.ts
```

---

## Zod Schemas & Types (`recruitment.types.ts`)

```ts
export type JobStatus = 'draft' | 'open' | 'closed'
export type CandidateStatus =
  | 'new'
  | 'screening'
  | 'interview'
  | 'offered'
  | 'hired'
  | 'rejected'
export type ReferralStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern'

export const JobPostingSchema = z.object({
  id: z.string(),
  title: z.string(),
  department: z.object({ id: z.string(), name: z.string() }),
  designation: z.object({ id: z.string(), name: z.string() }).optional(),
  location: z.string(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']),
  experienceLevel: z.string(),     // "1–3 years", "Senior", etc.
  salaryRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string().default('USD'),
  }).optional(),
  description: z.string(),
  requirements: z.string(),
  status: z.enum(['draft', 'open', 'closed']),
  openings: z.number(),
  applicantsCount: z.number(),
  postedDate: z.string().nullable(),
  closingDate: z.string().optional(),
  createdBy: z.object({ id: z.string(), name: z.string() }),
  createdAt: z.string(),
})

export const JobFormSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  departmentId: z.string().min(1, 'Department is required'),
  designationId: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']),
  experienceLevel: z.string().min(1, 'Experience level is required'),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
  status: z.enum(['draft', 'open', 'closed']),
  openings: z.number().min(1, 'At least 1 opening required'),
  closingDate: z.string().optional(),
}).refine(d => !d.salaryMin || !d.salaryMax || d.salaryMax >= d.salaryMin, {
  message: 'Max salary must be greater than min salary',
  path: ['salaryMax'],
})

export const CandidateSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  job: z.object({ id: z.string(), title: z.string() }),
  status: z.enum(['new', 'screening', 'interview', 'offered', 'hired', 'rejected']),
  experienceYears: z.number(),
  currentCompany: z.string().optional(),
  resumeUrl: z.string().optional(),
  appliedDate: z.string(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  source: z.enum(['direct', 'referral', 'job_board']).default('direct'),
  referredBy: z.object({ id: z.string(), name: z.string() }).optional(),
})

export const CandidateFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  jobId: z.string().min(1, 'Job is required'),
  experienceYears: z.number().min(0),
  currentCompany: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['new', 'screening', 'interview', 'offered', 'hired', 'rejected']).default('new'),
})

export const ReferralSchema = z.object({
  id: z.string(),
  referrer: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
  }),
  candidateName: z.string(),
  candidateEmail: z.string().email(),
  candidatePhone: z.string().optional(),
  job: z.object({ id: z.string(), title: z.string() }),
  relationship: z.string(),        // "Former colleague", "Friend", etc.
  notes: z.string().optional(),
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
  submittedDate: z.string(),
  reviewedBy: z.object({ id: z.string(), name: z.string() }).optional(),
  reviewedDate: z.string().optional(),
})

export const ReferralFormSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required'),
  candidateEmail: z.string().email('Invalid email'),
  candidatePhone: z.string().optional(),
  jobId: z.string().min(1, 'Job is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  notes: z.string().optional(),
})
```

---

## API Functions (`recruitment.api.ts`)

```ts
// ── Jobs ─────────────────────────────────────────────────────────────────

getJobs(params?: {
  search?: string
  departmentId?: string
  status?: JobStatus
  page?: number
  perPage?: number
}): Promise<{ data: JobPosting[]; total: number; page: number; totalPages: number }>
  GET /api/recruitment/jobs

getJob(id: string): Promise<JobPosting>
  GET /api/recruitment/jobs/:id

createJob(data: JobFormInput): Promise<JobPosting>
  POST /api/recruitment/jobs

updateJob(id: string, data: JobFormInput): Promise<JobPosting>
  PUT /api/recruitment/jobs/:id

deleteJob(id: string): Promise<void>
  DELETE /api/recruitment/jobs/:id

getOpenJobs(): Promise<JobPosting[]>
  GET /api/recruitment/jobs/open   // for referral/candidate job dropdowns

// ── Candidates ───────────────────────────────────────────────────────────

getCandidates(params?: {
  search?: string
  jobId?: string
  status?: CandidateStatus
  page?: number
  perPage?: number
}): Promise<{ data: Candidate[]; total: number; page: number; totalPages: number }>
  GET /api/recruitment/candidates

getCandidate(id: string): Promise<Candidate>
  GET /api/recruitment/candidates/:id

createCandidate(data: CandidateFormInput): Promise<Candidate>
  POST /api/recruitment/candidates

updateCandidate(id: string, data: Partial<CandidateFormInput>): Promise<Candidate>
  PUT /api/recruitment/candidates/:id

updateCandidateStatus(id: string, status: CandidateStatus): Promise<Candidate>
  PATCH /api/recruitment/candidates/:id/status

deleteCandidate(id: string): Promise<void>
  DELETE /api/recruitment/candidates/:id

// ── Referrals ────────────────────────────────────────────────────────────

getReferrals(params?: {
  search?: string
  jobId?: string
  status?: ReferralStatus
  page?: number
  perPage?: number
}): Promise<{ data: Referral[]; total: number; page: number; totalPages: number }>
  GET /api/recruitment/referrals

getMyReferrals(params?: { status?: ReferralStatus }): Promise<Referral[]>
  GET /api/recruitment/referrals/me

submitReferral(data: ReferralFormInput): Promise<Referral>
  POST /api/recruitment/referrals

updateReferralStatus(id: string, status: ReferralStatus): Promise<Referral>
  PATCH /api/recruitment/referrals/:id/status
```

**Mock data notes:**
- Seed 6–8 job postings (mix of draft/open/closed) linked to departments from `org-data.ts`.
- Seed 15–20 candidates across jobs with varied pipeline statuses.
- Seed 5–8 referrals (some linked to existing candidates via `source: 'referral'`).
- `applicantsCount` on jobs is computed from linked candidates count.

---

## UI Notes

Follow patterns in `ui-context.md`:
- Jobs page uses **grid view** (cards) as primary layout per project-overview.
- Candidates page uses **grid cards** with pipeline status colour coding.
- Salary ranges formatted with `formatCurrency()`.
- Status badges use `CandidateStatusBadge` / `ReferralStatusBadge` (similar to `AttendanceStatusBadge` pattern).

---

## 1. Jobs Page UI

### Page Header
- Title: "Jobs"
- Breadcrumbs: `[Recruitment] → [Jobs]`
- Right: `[+ Post Job]` button

### Filter Bar
- Search input (title, location)
- Department dropdown
- Status tabs: All | Draft | Open | Closed

### Grid Layout
Responsive grid: 1 col mobile / 2 col tablet / 3 col desktop.

Each `JobCard` shows:
```
┌─────────────────────────────────────┐
│  Software Engineer          [Open]  │
│  Engineering · San Francisco        │
│  Full-time · 1–3 years              │
│  $80,000 – $120,000                 │
│                                     │
│  3 openings · 12 applicants         │
│  Posted: Jun 1, 2026                │
│                                     │
│  [Edit]  [Delete]                   │
└─────────────────────────────────────┘
```
- Status badge top-right (Draft = muted, Open = success, Closed = error)
- Delete disabled (with tooltip) if job has active candidates

### Empty State
- "No job postings found" + "Post Job" button

### Add / Edit Job Modal
Fields:
- Job Title (required)
- Department (select)
- Designation (select, optional)
- Location (text)
- Employment Type (select)
- Experience Level (text)
- Salary Range Min / Max (optional number inputs)
- Number of Openings (number)
- Closing Date (optional date)
- Description (textarea)
- Requirements (textarea)
- Status (select: Draft / Open / Closed)

---

## 2. Candidates Page UI

### Page Header
- Title: "Candidates"
- Right: `[+ Add Candidate]` button

### Filter Bar
- Search input (name, email)
- Job dropdown (all open + closed jobs)
- Status dropdown (All / New / Screening / Interview / Offered / Hired / Rejected)

### Grid Layout
Each `CandidateCard` shows:
```
┌─────────────────────────────────────┐
│  [Avatar]  Sarah Chen               │
│            sarah.chen@email.com     │
│                                     │
│  Applied for: Software Engineer     │
│  ★★★★☆  ·  5 yrs exp              │
│                                     │
│  [Interview]          Jun 1, 2026   │
│                                     │
│  [View]  [Edit]  [→ Next Stage]    │
└─────────────────────────────────────┘
```
- Status badge with pipeline colour
- Star rating (if set)
- "Next Stage" button advances status one step in pipeline order
- Rejected/Hired candidates: no "Next Stage" button

### Pipeline Status Colours (`CandidateStatusBadge`)
```ts
const statusConfig = {
  new:        { label: 'New',        className: 'bg-info-bg text-info' },
  screening:  { label: 'Screening',  className: 'bg-warning-bg text-warning' },
  interview:  { label: 'Interview',  className: 'bg-warning-bg text-warning' },
  offered:    { label: 'Offered',    className: 'bg-success-bg text-success' },
  hired:      { label: 'Hired',      className: 'bg-success-bg text-success' },
  rejected:   { label: 'Rejected',   className: 'bg-error-bg text-error' },
}
```

### Candidate Detail Modal
- Full candidate profile: contact info, job applied, experience, notes, rating
- Status dropdown (admin can manually set any status)
- Resume link (mock: `#` URL, label "View Resume")
- Source badge (Direct / Referral / Job Board)
- If referral source: show referrer name

### Add / Edit Candidate Modal
Fields: Full Name, Email, Phone, Job (select from open jobs), Experience Years,
Current Company, Notes, Status (edit only)

---

## 3. Referrals Page UI

### Admin View

#### Page Header
- Title: "Referrals"

#### Filter Bar
- Search input (candidate name, referrer name)
- Job dropdown
- Status tabs: All | Pending | Reviewed | Accepted | Rejected

#### Table Columns
| Referrer | Candidate | Email | Job | Relationship | Submitted | Status | Actions |
- Referrer: avatar + name + department
- Actions (Pending/Reviewed): Accept (green check), Reject (red X)
- View icon for all statuses

#### Accept / Reject
- Accept: confirm dialog → creates a linked `Candidate` record with
  `source: 'referral'` and updates referral status to `accepted`
- Reject: confirm dialog (no reason required in v1)

### Employee View

#### Page Header
- Title: "My Referrals"
- Right: `[+ Submit Referral]` button

#### My Referrals Table
| Candidate | Job | Relationship | Submitted | Status |
- Status: `ReferralStatusBadge`
- No admin actions

#### Submit Referral Modal
Fields:
- Candidate Name (required)
- Candidate Email (required)
- Candidate Phone (optional)
- Job (select — open jobs only)
- Relationship (text, e.g. "Former colleague")
- Notes (textarea, optional)

---

## ViewModel Hooks

### `useJobsPageViewModel`
```ts
returns {
  jobs: JobPosting[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedDepartment: string
  setSelectedDepartment: (id: string) => void
  statusFilter: JobStatus | ''
  setStatusFilter: (s: JobStatus | '') => void
  departments: Department[]
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  selectedJob: JobPosting | null
  isFormModalOpen: boolean
  isDeleteModalOpen: boolean
  openAddModal: () => void
  openEditModal: (job: JobPosting) => void
  openDeleteModal: (job: JobPosting) => void
  closeModal: () => void
  onSubmit: (data: JobFormInput) => void
  onConfirmDelete: () => void
  isSubmitting: boolean
}
```

### `useCandidatesPageViewModel`
```ts
returns {
  candidates: Candidate[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedJob: string
  setSelectedJob: (id: string) => void
  selectedStatus: CandidateStatus | ''
  setSelectedStatus: (s: CandidateStatus | '') => void
  jobs: JobPosting[]
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  selectedCandidate: Candidate | null
  isFormModalOpen: boolean
  isDetailModalOpen: boolean
  openAddModal: () => void
  openEditModal: (c: Candidate) => void
  openDetailModal: (c: Candidate) => void
  closeModal: () => void
  onSubmit: (data: CandidateFormInput) => void
  onAdvanceStatus: (id: string) => void
  onUpdateStatus: (id: string, status: CandidateStatus) => void
  isSubmitting: boolean
}
```

### `useReferralsPageViewModel`
```ts
returns {
  isAdmin: boolean
}
```

### `useAdminReferralsViewModel`
```ts
returns {
  referrals: Referral[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedJob: string
  setSelectedJob: (id: string) => void
  statusFilter: ReferralStatus | ''
  setStatusFilter: (s: ReferralStatus | '') => void
  jobs: JobPosting[]
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
}
```

### `useEmployeeReferralsViewModel`
```ts
returns {
  referrals: Referral[]
  isLoading: boolean
  isFormModalOpen: boolean
  openFormModal: () => void
  closeFormModal: () => void
  openJobs: JobPosting[]
  onSubmit: (data: ReferralFormInput) => void
  isSubmitting: boolean
}
```

---

## Route Guards

Wrap in `RoleGuard` in `routes.tsx`:
- `/recruitment/jobs` → `['super_admin', 'hr_admin']`
- `/recruitment/candidates` → `['super_admin', 'hr_admin']`
- `/recruitment/referrals` → all authenticated roles (role-split inside page)

---

## Delete Guards

| Entity    | Block condition                                      | UI behaviour                          |
| --------- | ---------------------------------------------------- | ------------------------------------- |
| Job       | Has linked candidates (`applicantsCount > 0`)        | Disable delete, show warning in modal |
| Candidate | None in v1                                           | Standard confirm dialog               |

---

## Acceptance Criteria

1. Jobs grid displays all postings with correct status badges and applicant counts.
2. Admin can create, edit, and delete job postings via modal.
3. Jobs with candidates cannot be deleted (warning shown, confirm disabled).
4. Candidates grid shows pipeline status with correct colour badges.
5. "Next Stage" button advances candidate one step in the pipeline order.
6. Candidate detail modal shows full profile including referral source if applicable.
7. Admin can manually set any candidate status from the detail modal.
8. Employee can submit a referral for an open job position.
9. Employee sees only their own referrals; admin sees all referrals.
10. Admin accepting a referral creates a linked candidate record and updates referral status.
11. Job and candidate dropdowns in filters/forms are populated from shared mock store.
12. All pages show loading skeletons and empty states appropriately.
13. `npm run build` passes with zero TypeScript errors after implementation.
