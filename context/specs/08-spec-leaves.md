# Spec 08 — Leaves

## Goal

Build the Leaves module. Admins manage leave types, view all employee leave
requests, and approve/reject them. Employees apply for leave, view their
balance, and track request status. Includes leave type configuration.

---

## Routes

| Path       | Page          | Role      |
| ---------- | ------------- | --------- |
| `/leaves`  | `LeavesPage`  | All roles |

Admin sees full leave management view. Employee sees their own leaves and
apply form. Role-split via sub-components in the same route.

---

## File Structure

```
src/
├── pages/
│   └── Leaves/
│       ├── LeavesPage.tsx
│       ├── LeavesPage.viewmodel.ts
│       └── components/
│           ├── AdminLeavesView.tsx
│           ├── AdminLeavesView.viewmodel.ts
│           ├── EmployeeLeavesView.tsx
│           ├── EmployeeLeavesView.viewmodel.ts
│           ├── LeaveBalanceCard.tsx
│           ├── ApplyLeaveModal.tsx
│           ├── LeaveDetailModal.tsx
│           ├── ApproveRejectModal.tsx
│           └── LeaveTypeFormModal.tsx
├── api/
│   └── leaves.api.ts
└── types/
    └── leave.types.ts
```

---

## Zod Schemas & Types (`leave.types.ts`)

```ts
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export const LeaveTypeSchema = z.object({
  id: z.string(),
  name: z.string(),            // "Annual Leave", "Sick Leave", etc.
  color: z.string(),           // hex for calendar display
  defaultDays: z.number(),     // days allotted per year
  carryForward: z.boolean(),
  requiresDocument: z.boolean(),
  isActive: z.boolean(),
})

export const LeaveBalanceSchema = z.object({
  leaveTypeId: z.string(),
  leaveTypeName: z.string(),
  color: z.string(),
  allocated: z.number(),
  used: z.number(),
  pending: z.number(),
  remaining: z.number(),
})

export const LeaveRequestSchema = z.object({
  id: z.string(),
  employee: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
  }),
  leaveType: z.object({ id: z.string(), name: z.string(), color: z.string() }),
  fromDate: z.string(),
  toDate: z.string(),
  days: z.number(),
  reason: z.string(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']),
  appliedOn: z.string(),
  approvedBy: z.object({ id: z.string(), name: z.string() }).optional(),
  approvedOn: z.string().optional(),
  rejectionReason: z.string().optional(),
  documentUrl: z.string().optional(),
})

export const ApplyLeaveFormSchema = z.object({
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  reason: z.string().min(5, 'Please provide a reason (min 5 characters)'),
  document: z.instanceof(File).optional(),
}).refine(d => new Date(d.toDate) >= new Date(d.fromDate), {
  message: 'To date must be after from date',
  path: ['toDate'],
})

export const RejectLeaveFormSchema = z.object({
  reason: z.string().min(5, 'Rejection reason is required'),
})
```

---

## API Functions (`leaves.api.ts`)

```ts
// Leave Types (admin)
getLeaveTypes(): Promise<LeaveType[]>
  GET /api/leave-types

createLeaveType(data: LeaveTypeFormInput): Promise<LeaveType>
  POST /api/leave-types

updateLeaveType(id: string, data: LeaveTypeFormInput): Promise<LeaveType>
  PUT /api/leave-types/:id

deleteLeaveType(id: string): Promise<void>
  DELETE /api/leave-types/:id

// Leave Requests (admin)
getLeaveRequests(params: {
  status?: LeaveStatus
  departmentId?: string
  leaveTypeId?: string
  month?: number
  year?: number
  page?: number
  perPage?: number
}): Promise<{ data: LeaveRequest[]; total: number }>
  GET /api/leaves

approveLeave(id: string): Promise<LeaveRequest>
  PATCH /api/leaves/:id/approve

rejectLeave(id: string, reason: string): Promise<LeaveRequest>
  PATCH /api/leaves/:id/reject

// Employee leave
getMyLeaveBalance(): Promise<LeaveBalance[]>
  GET /api/leaves/my-balance

getMyLeaveRequests(params?: { status?: LeaveStatus }): Promise<LeaveRequest[]>
  GET /api/leaves/my-requests

applyLeave(data: ApplyLeaveFormInput): Promise<LeaveRequest>
  POST /api/leaves/apply  (multipart/form-data if document attached)

cancelLeave(id: string): Promise<LeaveRequest>
  PATCH /api/leaves/:id/cancel
```

---

## Admin Leaves View UI

### Tabs
Three top-level tabs:
1. **Leave Requests** — table of all requests with approval actions
2. **Leave Types** — manage leave type configurations
3. **Leave Overview** — summary statistics (optional, can be built as enhancement)

### Leave Requests Tab

**Filter Bar**: Status (All/Pending/Approved/Rejected), Department, Leave Type, Month/Year

**Table Columns**:
| Employee | Leave Type | From | To | Days | Applied On | Status | Actions |
- Employee: avatar + name + department
- Leave Type: coloured dot + name
- Status: StatusBadge
- Actions (Pending only): `✓ Approve` (green), `✗ Reject` (red) icon buttons
  + `👁 View` for all statuses

**Approve action**: Confirm dialog → "Approve [Name]'s [Type] leave for [N] days?"
**Reject action**: Modal with rejection reason textarea (required)

### Leave Types Tab

**Table Columns**:
| Leave Type | Color | Days/Year | Carry Forward | Requires Document | Status | Actions |
- Color: coloured square swatch
- Carry Forward: ✓ / ✗
- Status: Active / Inactive badge
- Actions: Edit, Delete (guard: cannot delete if active requests exist)

**Add / Edit Leave Type Modal**:
Fields: Name, Color picker, Days per year, Carry forward toggle, Require document toggle, Active toggle

---

## Employee Leaves View UI

### Leave Balance Cards
Row of balance cards, one per leave type:
```
┌──────────────────────┐
│  🟢 Annual Leave     │
│                      │
│  12 / 18             │
│  Used / Allocated    │
│                      │
│  6 remaining         │
│  Progress bar        │
└──────────────────────┘
```
Progress bar: `remaining / allocated` percentage, coloured with leave type colour.

### Apply Leave Button
`[+ Apply for Leave]` button (top right) → opens `ApplyLeaveModal`.

### Apply Leave Modal
Fields:
- Leave Type (select, shows remaining balance inline)
- From Date (date picker)
- To Date (date picker)
- Number of days (auto-calculated, displayed read-only)
- Reason (textarea)
- Upload Document (shown only if leave type requires it)

Validation: from/to dates must not overlap with existing approved leave. Must
have sufficient balance.

### My Leave Requests Table

**Filter**: Status tabs (All | Pending | Approved | Rejected | Cancelled)

**Table Columns**:
| Leave Type | From | To | Days | Applied On | Status | Actions |
- Actions: `Cancel` button (only on Pending status; shows confirm dialog)

---

## ViewModel Hooks

### `useAdminLeavesViewModel`
```ts
returns {
  // Leave Requests tab
  leaveRequests: LeaveRequest[]
  isLoading: boolean
  statusFilter: LeaveStatus | ''
  departmentFilter: string
  leaveTypeFilter: string
  setStatusFilter, setDepartmentFilter, setLeaveTypeFilter
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  onApprove: (id: string) => void
  openRejectModal: (request: LeaveRequest) => void
  rejectingRequest: LeaveRequest | null
  onConfirmReject: (reason: string) => void
  closeRejectModal: () => void
  // Leave Types tab
  leaveTypes: LeaveType[]
  openAddLeaveTypeModal: () => void
  openEditLeaveTypeModal: (lt: LeaveType) => void
  openDeleteLeaveTypeModal: (lt: LeaveType) => void
  onSubmitLeaveType: (data: LeaveTypeFormInput) => void
  onConfirmDeleteLeaveType: () => void
  activeTab: 'requests' | 'types'
  setActiveTab: (t: 'requests' | 'types') => void
}
```

### `useEmployeeLeavesViewModel`
```ts
returns {
  balances: LeaveBalance[]
  leaveRequests: LeaveRequest[]
  isLoading: boolean
  statusFilter: LeaveStatus | ''
  setStatusFilter: (s: LeaveStatus | '') => void
  isApplyModalOpen: boolean
  openApplyModal: () => void
  closeApplyModal: () => void
  applyForm: UseFormReturn<ApplyLeaveFormInput>
  onSubmitApply: (data: ApplyLeaveFormInput) => void
  isSubmitting: boolean
  onCancelLeave: (id: string) => void
}
```

---

## Acceptance Criteria

1. Leave balance cards display correct used/remaining counts with progress bars.
2. Apply leave form calculates days automatically from date range.
3. Apply form validates sufficient balance before allowing submission.
4. Admin approve action updates status to "approved" immediately (optimistic update).
5. Admin reject modal requires a reason before confirming.
6. Rejected leaves show rejection reason in the detail view.
7. Employee can cancel a pending leave request with confirmation.
8. Leave types with active requests cannot be deleted.
9. New leave type appears immediately in the Apply Leave modal dropdown.
10. Status filter tabs update the leave request list correctly.
