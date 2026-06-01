# Spec 05 — Employees

## Goal

Build the Employee module: directory listing (grid + list toggle), employee
creation/edit modal, and the full employee detail/profile page. Includes
personal info, work info, documents, assets, and employment timeline tabs.

---

## Routes

| Path                    | Page                      | Role             |
| ----------------------- | ------------------------- | ---------------- |
| `/employees`            | `EmployeesPage`           | hr_admin, super_admin |
| `/employees/:id`        | `EmployeeDetailPage`      | hr_admin, super_admin, employee (own only) |

---

## File Structure

```
src/
├── pages/
│   └── Employees/
│       ├── EmployeesPage.tsx
│       ├── EmployeesPage.viewmodel.ts
│       ├── EmployeeDetailPage.tsx
│       ├── EmployeeDetailPage.viewmodel.ts
│       └── components/
│           ├── EmployeeCard.tsx          ← grid card
│           ├── EmployeeTableRow.tsx      ← list view row
│           ├── EmployeeFilters.tsx       ← search + filter bar
│           ├── AddEditEmployeeModal.tsx
│           ├── DeleteEmployeeModal.tsx
│           ├── tabs/
│           │   ├── PersonalInfoTab.tsx
│           │   ├── WorkInfoTab.tsx
│           │   ├── DocumentsTab.tsx
│           │   ├── AssetsTab.tsx
│           │   └── TimelineTab.tsx
├── api/
│   └── employees.api.ts
└── types/
    └── employee.types.ts
```

---

## Zod Schemas & Types (`employee.types.ts`)

```ts
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated'

export const EmployeeSchema = z.object({
  id: z.string(),
  employeeId: z.string(),         // e.g. "EMP-001"
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  department: z.object({ id: z.string(), name: z.string() }),
  designation: z.object({ id: z.string(), name: z.string() }),
  role: z.enum(['super_admin', 'hr_admin', 'employee']),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']),
  joinDate: z.string(),
  managerId: z.string().optional(),
  managerName: z.string().optional(),
  location: z.string().optional(),
})

export const EmployeeDetailSchema = EmployeeSchema.extend({
  personal: z.object({
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
    nationality: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    emergencyContact: z.object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string(),
    }).optional(),
  }),
  work: z.object({
    employeeType: z.enum(['full_time', 'part_time', 'contract', 'intern']),
    workLocation: z.enum(['office', 'remote', 'hybrid']),
    probationEndDate: z.string().optional(),
    reportingManager: z.object({ id: z.string(), name: z.string() }).optional(),
    shift: z.string().optional(),
  }),
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    uploadedAt: z.string(),
    url: z.string(),
  })),
  assets: z.array(z.object({
    id: z.string(),
    name: z.string(),
    assetId: z.string(),
    category: z.string(),
    assignedDate: z.string(),
    status: z.enum(['assigned', 'returned', 'damaged']),
  })),
  timeline: z.array(z.object({
    id: z.string(),
    event: z.string(),
    description: z.string().optional(),
    date: z.string(),
    type: z.enum(['joined', 'promoted', 'transferred', 'left', 'other']),
  })),
})

// Create / Edit form
export const EmployeeFormSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email(),
  phone: z.string().optional(),
  departmentId: z.string().min(1, 'Required'),
  designationId: z.string().min(1, 'Required'),
  role: z.enum(['hr_admin', 'employee']),
  joinDate: z.string().min(1, 'Required'),
  location: z.string().optional(),
  managerId: z.string().optional(),
})

export const EmployeeListResponseSchema = z.object({
  data: z.array(EmployeeSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})
```

---

## API Functions (`employees.api.ts`)

```ts
getEmployees(params: {
  page?: number
  perPage?: number
  search?: string
  departmentId?: string
  status?: EmployeeStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}): Promise<EmployeeListResponse>
  GET /api/employees

getEmployee(id: string): Promise<EmployeeDetail>
  GET /api/employees/:id

createEmployee(data: EmployeeFormInput): Promise<Employee>
  POST /api/employees

updateEmployee(id: string, data: Partial<EmployeeFormInput>): Promise<Employee>
  PUT /api/employees/:id

deleteEmployee(id: string): Promise<void>
  DELETE /api/employees/:id

updateEmployeeStatus(id: string, status: EmployeeStatus): Promise<Employee>
  PATCH /api/employees/:id/status

uploadAvatar(id: string, file: File): Promise<{ avatarUrl: string }>
  POST /api/employees/:id/avatar  (multipart/form-data)
```

---

## EmployeesPage ViewModel (`useEmployeesPageViewModel`)

```ts
returns {
  employees: Employee[]
  isLoading: boolean
  total: number
  page: number
  totalPages: number

  // View toggle
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void

  // Filters
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedDepartment: string
  setSelectedDepartment: (id: string) => void
  selectedStatus: EmployeeStatus | ''
  setSelectedStatus: (s: EmployeeStatus | '') => void

  // Pagination
  onPageChange: (page: number) => void

  // CRUD
  selectedEmployee: Employee | null
  openAddModal: () => void
  openEditModal: (emp: Employee) => void
  openDeleteModal: (emp: Employee) => void
  closeModal: () => void
  isAddEditModalOpen: boolean
  isDeleteModalOpen: boolean
  isSubmitting: boolean
  onSubmitAddEdit: (data: EmployeeFormInput) => void
  onConfirmDelete: () => void
}
```

---

## EmployeesPage UI

### Page Header
- Title: "Employees"
- Right: `[Grid icon] [List icon]` toggle + `[+ Add Employee]` button

### Filter Bar (below header)
- Search input with search icon (debounced 300ms)
- Department dropdown filter
- Status dropdown filter (All / Active / Inactive / On Leave / Terminated)
- Employee count: "Showing X of Y employees"

### Grid View
- 4-column grid on desktop, 2-column tablet, 1-column mobile
- Each `EmployeeCard`:
  ```
  ┌────────────────────────┐
  │    [Avatar h-16 w-16]  │
  │    Full Name           │
  │    Designation         │
  │    Department badge    │
  │    Status badge        │
  │    [📧] [✏️] [🗑️]      │
  └────────────────────────┘
  ```

### List View
Data table columns:
| # | Employee | Department | Designation | Join Date | Status | Actions |
- Employee column: avatar + name + email stacked
- Actions: Eye (→ detail page), Edit (modal), Delete (confirm modal)

### Pagination
- Below table/grid: "Showing 1–20 of 84" + prev/next + page number buttons

---

## Add / Edit Employee Modal

Two-tab form:
1. **Basic Info**: First Name, Last Name, Email, Phone, Join Date, Location
2. **Work Details**: Department (select), Designation (select), Role (select),
   Reporting Manager (select / search), Employee Type, Work Location

Footer: Cancel + Save buttons. On edit: modal pre-populated with existing data.

---

## EmployeeDetailPage UI

### Header Card
```
┌─────────────────────────────────────────────────────────────┐
│  [Avatar h-20]  Full Name                     [Edit] [More▾]│
│                 Designation · Department                     │
│                 📧 email   📱 phone   📍 location            │
│  EMP-001        Status badge    Joined: Jan 15, 2023         │
└─────────────────────────────────────────────────────────────┘
```

### Tabs
- **Personal Info** — Date of birth, gender, marital status, nationality,
  address, emergency contact. Edit inline with pencil icon.
- **Work Info** — Employee type, work location, probation end, shift,
  reporting manager.
- **Documents** — Upload area + list of uploaded docs with download/delete.
- **Assets** — Table of assigned assets: asset name, ID, category, assigned
  date, status badge.
- **Timeline** — Vertical timeline of employment events (joined, promoted, etc.)

---

## EmployeeDetailPage ViewModel (`useEmployeeDetailPageViewModel`)

```ts
returns {
  employee: EmployeeDetail | undefined
  isLoading: boolean
  activeTab: string
  setActiveTab: (tab: string) => void
  onEditPersonal: (data: Partial<EmployeeDetail['personal']>) => void
  onEditWork: (data: Partial<EmployeeDetail['work']>) => void
  onUploadDocument: (file: File, name: string) => void
  onDeleteDocument: (docId: string) => void
  isCurrentUser: boolean   // true if viewing own profile
  canEdit: boolean         // true if hr_admin/super_admin or own profile
}
```

---

## Acceptance Criteria

1. Grid and list views both render employee data with correct fields.
2. Search filters employees client-debounced, then server-filtered on submit.
3. Department and status filters update the result list.
4. Add Employee modal creates a new employee and refreshes the list.
5. Edit Employee modal pre-populates all fields and saves changes.
6. Delete confirmation modal removes employee and updates list.
7. Employee detail page loads all 5 tabs with correct data.
8. Employee can view their own profile page; cannot see other profiles.
9. Status badge colours match `ui-context.md` StatusBadge spec.
10. Pagination controls navigate between pages correctly.
