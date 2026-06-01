# Spec 11 — Support Tickets

## Goal

Build the Support Tickets module. Employees create and track support tickets.
Admins and HR staff view all tickets, update status, assign handlers, and reply
via a threaded comment system on the ticket detail page.

---

## Routes

| Path            | Page                 | Role                              |
| --------------- | -------------------- | --------------------------------- |
| `/tickets`      | `TicketsPage`        | hr_admin, super_admin, employee   |
| `/tickets/:id`  | `TicketDetailPage`   | hr_admin, super_admin, employee   |

`TicketsPage` renders `<AdminTicketsView>` or `<EmployeeTicketsView>` based on
role. `TicketDetailPage` is accessible to all roles; employees may only view
their own tickets (redirect to `/tickets` if unauthorized).

---

## File Structure

```
src/
├── pages/
│   └── Tickets/
│       ├── TicketsPage.tsx
│       ├── TicketsPage.viewmodel.ts
│       ├── TicketDetailPage.tsx
│       ├── TicketDetailPage.viewmodel.ts
│       └── components/
│           ├── AdminTicketsView.tsx
│           ├── AdminTicketsView.viewmodel.ts
│           ├── EmployeeTicketsView.tsx
│           ├── EmployeeTicketsView.viewmodel.ts
│           ├── TicketTableRow.tsx
│           ├── TicketFilters.tsx
│           ├── CreateTicketModal.tsx
│           ├── TicketStatusBadge.tsx
│           ├── TicketPriorityBadge.tsx
│           ├── TicketCommentThread.tsx
│           ├── TicketCommentForm.tsx
│           ├── TicketInfoPanel.tsx
│           └── AssignTicketModal.tsx
├── api/
│   └── tickets.api.ts
└── types/
    └── ticket.types.ts
```

---

## Zod Schemas & Types (`ticket.types.ts`)

```ts
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketCategory =
  | 'general'
  | 'payroll'
  | 'leave'
  | 'it_support'
  | 'facilities'
  | 'other'

export const TicketCommentSchema = z.object({
  id: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    role: z.enum(['super_admin', 'hr_admin', 'employee']),
  }),
  body: z.string(),
  createdAt: z.string(),
  isInternal: z.boolean().default(false),  // admin-only notes, hidden from employee
})

export const TicketSchema = z.object({
  id: z.string(),
  ticketNumber: z.string(),        // e.g. "TKT-0042"
  subject: z.string(),
  description: z.string(),
  category: z.enum(['general', 'payroll', 'leave', 'it_support', 'facilities', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
  }),
  assignedTo: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
  }).optional(),
  commentsCount: z.number(),
  lastActivityAt: z.string(),
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
})

export const TicketDetailSchema = TicketSchema.extend({
  comments: z.array(TicketCommentSchema),
})

export const CreateTicketFormSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['general', 'payroll', 'leave', 'it_support', 'facilities', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
})

export const AddCommentFormSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty'),
  isInternal: z.boolean().default(false),
})

export const UpdateTicketFormSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedToId: z.string().optional(),
})
```

---

## API Functions (`tickets.api.ts`)

```ts
// ── Ticket List ──────────────────────────────────────────────────────────

getTickets(params?: {
  search?: string
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  assignedToId?: string
  page?: number
  perPage?: number
}): Promise<{ data: Ticket[]; total: number; page: number; totalPages: number }>
  GET /api/tickets

getMyTickets(params?: {
  status?: TicketStatus
  page?: number
  perPage?: number
}): Promise<{ data: Ticket[]; total: number; page: number; totalPages: number }>
  GET /api/tickets/me

// ── Ticket Detail ────────────────────────────────────────────────────────

getTicket(id: string): Promise<TicketDetail>
  GET /api/tickets/:id

createTicket(data: CreateTicketFormInput): Promise<Ticket>
  POST /api/tickets

updateTicket(id: string, data: UpdateTicketFormInput): Promise<TicketDetail>
  PATCH /api/tickets/:id

addComment(ticketId: string, data: AddCommentFormInput): Promise<TicketComment>
  POST /api/tickets/:id/comments

closeTicket(id: string): Promise<TicketDetail>
  PATCH /api/tickets/:id/close

reopenTicket(id: string): Promise<TicketDetail>
  PATCH /api/tickets/:id/reopen

getAssigneeOptions(): Promise<Array<{ id: string; name: string }>>
  GET /api/tickets/assignees   // returns hr_admin + super_admin users from mock store
```

**Mock data notes:**
- Seed 15–20 tickets with varied statuses, priorities, and categories.
- Seed 2–5 comments per ticket (mix of employee and admin authors).
- `ticketNumber` auto-generated as `TKT-XXXX` sequential.
- Assignee options: employees with `hr_admin` or `super_admin` role from employees store.
- Employees can only access tickets where `createdBy.id === currentUser.id`.

---

## UI Notes

Follow patterns in `ui-context.md`:
- List page uses standard data table layout.
- Detail page uses a two-column layout on desktop: main content (left) + info panel (right).
- On mobile/tablet: info panel stacks below the comment thread.
- Status and priority badges follow the StatusBadge colour conventions.

---

## 1. Tickets List Page UI

### Admin View

#### Page Header
- Title: "Tickets"
- Breadcrumbs: `[Support] → [Tickets]`

#### Summary Cards (optional row, 4 cards)
| Open | In Progress | Resolved | Closed |
- Counts for all tickets (unfiltered totals from API summary field)

#### Filter Bar
- Search input (subject, ticket number, creator name)
- Status dropdown (All / Open / In Progress / Resolved / Closed)
- Priority dropdown (All / Low / Medium / High / Urgent)
- Category dropdown
- Assignee dropdown (All / Unassigned / specific assignee)

#### Table Columns
| # | Subject | Created By | Category | Priority | Status | Assigned To | Last Activity | Actions |
- `#`: ticket number (mono font, e.g. `TKT-0042`)
- Subject: truncated to 60 chars, full text in tooltip
- Created By: avatar + name
- Priority: `TicketPriorityBadge`
- Status: `TicketStatusBadge`
- Last Activity: relative time (e.g. "2 hours ago") via `date-fns/formatDistanceToNow`
- Actions: View (eye icon) → navigates to `/tickets/:id`

### Employee View

#### Page Header
- Title: "My Tickets"
- Right: `[+ New Ticket]` button

#### Filter Bar
- Status tabs: All | Open | In Progress | Resolved | Closed

#### Table Columns
| # | Subject | Category | Priority | Status | Created | Last Activity | Actions |
- Actions: View (eye icon)
- No assignee column for employees

#### Create Ticket Modal
Fields:
- Subject (text, required)
- Category (select)
- Priority (select, default Medium)
- Description (textarea, required)

On success: navigate to the new ticket detail page.

---

## 2. Ticket Detail Page UI

### Layout
```
┌─────────────────────────────────────────┬──────────────────┐
│  TKT-0042 · Payroll query               │  Ticket Info     │
│  [Open] [High]                          │                  │
│  Created by Jane Employee · Jun 1, 2026  │  Status: Open    │
│  ─────────────────────────────────────  │  Priority: High  │
│                                         │  Category: Payroll│
│  Description                            │  Assigned: —     │
│  I have a question about my...          │  Created: ...    │
│                                         │                  │
│  ─── Comments (3) ───                   │  [Assign]        │
│                                         │  [Change Status] │
│  [Avatar] HR Admin · 2 hours ago      │                  │
│  We've reviewed your query...           │                  │
│                                         │                  │
│  [Avatar] Jane Employee · 1 hour ago    │                  │
│  Thank you, that helps.                 │                  │
│                                         │                  │
│  ┌─────────────────────────────────┐   │                  │
│  │ Write a reply...                │   │                  │
│  │                                 │   │                  │
│  └─────────────────────────────────┘   │                  │
│  [ ] Internal note (admin only)         │                  │
│  [Send Reply]                           │                  │
└─────────────────────────────────────────┴──────────────────┘
```

### Ticket Header
- Ticket number + subject (large)
- Status badge + Priority badge
- Created by + date

### Description Section
- Full ticket description text (plain, no truncation)

### Comment Thread (`TicketCommentThread`)
- Chronological list (oldest first)
- Each comment: avatar, author name, role label (admin only), timestamp, body
- Internal comments (`isInternal: true`): highlighted with yellow left border,
  labelled "Internal Note", **hidden from employee view entirely**
- Empty state: "No comments yet. Be the first to reply."

### Comment Form (`TicketCommentForm`)
- Textarea + Send button
- Admin sees "Internal note" checkbox (comments with this flag hidden from employee)
- Disabled if ticket status is `closed`

### Info Panel (`TicketInfoPanel`)
- Status (with inline dropdown for admin to change)
- Priority (with inline dropdown for admin)
- Category (read-only)
- Assigned To (read-only text + `[Assign]` button for admin)
- Created date, Resolved date (if applicable)
- Admin actions:
  - `[Assign]` → opens AssignTicketModal
  - `[Mark Resolved]` (if open/in_progress)
  - `[Close Ticket]` (if resolved)
  - `[Reopen]` (if closed/resolved)

### Assign Ticket Modal
- Assignee select (populated from `getAssigneeOptions()`)
- Confirm button

### Access Control
- Employee viewing another employee's ticket → redirect to `/tickets`
- Employee cannot see internal comments
- Employee cannot change status, priority, or assignee

---

## Status & Priority Badges

### `TicketStatusBadge`
```ts
const statusConfig = {
  open:         { label: 'Open',         className: 'bg-info-bg text-info' },
  in_progress:  { label: 'In Progress',  className: 'bg-warning-bg text-warning' },
  resolved:     { label: 'Resolved',     className: 'bg-success-bg text-success' },
  closed:       { label: 'Closed',       className: 'bg-surface-alt text-muted' },
}
```

### `TicketPriorityBadge`
```ts
const priorityConfig = {
  low:    { label: 'Low',    className: 'bg-surface-alt text-secondary' },
  medium: { label: 'Medium', className: 'bg-info-bg text-info' },
  high:   { label: 'High',   className: 'bg-warning-bg text-warning' },
  urgent: { label: 'Urgent', className: 'bg-error-bg text-error' },
}
```

---

## ViewModel Hooks

### `useTicketsPageViewModel`
```ts
returns {
  isAdmin: boolean
}
```

### `useAdminTicketsViewModel`
```ts
returns {
  tickets: Ticket[]
  isLoading: boolean
  statusCounts: { open: number; inProgress: number; resolved: number; closed: number }
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedStatus: TicketStatus | ''
  setSelectedStatus: (s: TicketStatus | '') => void
  selectedPriority: TicketPriority | ''
  setSelectedPriority: (p: TicketPriority | '') => void
  selectedCategory: TicketCategory | ''
  setSelectedCategory: (c: TicketCategory | '') => void
  selectedAssignee: string
  setSelectedAssignee: (id: string) => void
  assignees: Array<{ id: string; name: string }>
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}
```

### `useEmployeeTicketsViewModel`
```ts
returns {
  tickets: Ticket[]
  isLoading: boolean
  statusFilter: TicketStatus | ''
  setStatusFilter: (s: TicketStatus | '') => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  isCreateModalOpen: boolean
  openCreateModal: () => void
  closeCreateModal: () => void
  onSubmitCreate: (data: CreateTicketFormInput) => void
  isSubmitting: boolean
}
```

### `useTicketDetailPageViewModel`
```ts
returns {
  ticket: TicketDetail | undefined
  isLoading: boolean
  isAdmin: boolean
  isOwner: boolean
  commentForm: UseFormReturn<AddCommentFormInput>
  onSubmitComment: (data: AddCommentFormInput) => void
  isSubmittingComment: boolean
  onUpdateStatus: (status: TicketStatus) => void
  onUpdatePriority: (priority: TicketPriority) => void
  onAssign: (assigneeId: string) => void
  onMarkResolved: () => void
  onCloseTicket: () => void
  onReopen: () => void
  isAssignModalOpen: boolean
  openAssignModal: () => void
  closeAssignModal: () => void
  assignees: Array<{ id: string; name: string }>
}
```

---

## Acceptance Criteria

1. Employee can create a new ticket via modal and is redirected to the detail page.
2. Employee sees only their own tickets in the list view.
3. Employee cannot view another employee's ticket (redirect to `/tickets`).
4. Admin sees all tickets with full filter controls.
5. Ticket detail page displays description and chronological comment thread.
6. Admin can post public replies and internal notes; employees see only public replies.
7. Admin can change ticket status and priority from the info panel.
8. Admin can assign a ticket to an HR admin via the assign modal.
9. Comment form is disabled on closed tickets.
10. New comments appear immediately after submission (invalidate query).
11. Status summary cards on admin list show correct counts.
12. Ticket list supports pagination and all filters work correctly.
13. Loading skeletons show on list and detail pages while fetching.
14. `npm run build` passes with zero TypeScript errors after implementation.
