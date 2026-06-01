# Spec 06 — Departments & Designations

## Goal

Build the Departments and Designations management pages. Both follow the same
pattern: a searchable table with inline add/edit/delete modal. Departments also
display a department head and employee count. These lists feed the dropdowns
in the Employee module.

---

## Routes

| Path              | Page                    | Role                    |
| ----------------- | ----------------------- | ----------------------- |
| `/departments`    | `DepartmentsPage`       | hr_admin, super_admin   |
| `/designations`   | `DesignationsPage`      | hr_admin, super_admin   |

---

## File Structure

```
src/
├── pages/
│   ├── Departments/
│   │   ├── DepartmentsPage.tsx
│   │   ├── DepartmentsPage.viewmodel.ts
│   │   └── components/
│   │       ├── DepartmentFormModal.tsx
│   │       └── DeleteDepartmentModal.tsx
│   └── Designations/
│       ├── DesignationsPage.tsx
│       ├── DesignationsPage.viewmodel.ts
│       └── components/
│           ├── DesignationFormModal.tsx
│           └── DeleteDesignationModal.tsx
├── api/
│   ├── departments.api.ts
│   └── designations.api.ts
└── types/
    ├── department.types.ts
    └── designation.types.ts
```

---

## Zod Schemas & Types

### `department.types.ts`
```ts
export const DepartmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  headEmployee: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
  }).optional(),
  employeeCount: z.number(),
  createdAt: z.string(),
})

export const DepartmentFormSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
  headEmployeeId: z.string().optional(),
})
```

### `designation.types.ts`
```ts
export const DesignationSchema = z.object({
  id: z.string(),
  name: z.string(),
  department: z.object({ id: z.string(), name: z.string() }).optional(),
  employeeCount: z.number(),
  createdAt: z.string(),
})

export const DesignationFormSchema = z.object({
  name: z.string().min(1, 'Designation name is required'),
  departmentId: z.string().optional(),
})
```

---

## API Functions

### `departments.api.ts`
```ts
getDepartments(params?: { search?: string }): Promise<Department[]>
  GET /api/departments

createDepartment(data: DepartmentFormInput): Promise<Department>
  POST /api/departments

updateDepartment(id: string, data: DepartmentFormInput): Promise<Department>
  PUT /api/departments/:id

deleteDepartment(id: string): Promise<void>
  DELETE /api/departments/:id
```

### `designations.api.ts`
```ts
getDesignations(params?: { search?: string; departmentId?: string }): Promise<Designation[]>
  GET /api/designations

createDesignation(data: DesignationFormInput): Promise<Designation>
  POST /api/designations

updateDesignation(id: string, data: DesignationFormInput): Promise<Designation>
  PUT /api/designations/:id

deleteDesignation(id: string): Promise<void>
  DELETE /api/designations/:id
```

---

## Departments Page UI

### Page Header
- Title: "Departments"
- Right: `[+ Add Department]` button

### Filter Bar
- Search input (client-side filter on loaded data — departments list is short)

### Table Columns
| Department Name | Department Head | Total Employees | Created Date | Actions |
- Department Head: avatar + name or "—" if unassigned
- Total Employees: number pill badge
- Actions: Edit icon, Delete icon

### Empty State
- Illustration + "No departments found" + "Add Department" button

### Add / Edit Department Modal
Fields:
- Department Name (required)
- Description (textarea, optional)
- Department Head (searchable employee select, optional)

---

## Designations Page UI

### Page Header
- Title: "Designations"
- Right: `[+ Add Designation]` button

### Filter Bar
- Search input
- Department filter dropdown

### Table Columns
| Designation Name | Department | Total Employees | Created Date | Actions |
- Actions: Edit icon, Delete icon

### Add / Edit Designation Modal
Fields:
- Designation Name (required)
- Department (select from departments list, optional)

---

## ViewModel Hooks

### `useDepartmentsPageViewModel`
```ts
returns {
  departments: Department[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  filteredDepartments: Department[]   // client-filtered
  selectedDepartment: Department | null
  isFormModalOpen: boolean
  isDeleteModalOpen: boolean
  openAddModal: () => void
  openEditModal: (dept: Department) => void
  openDeleteModal: (dept: Department) => void
  closeModal: () => void
  onSubmit: (data: DepartmentFormInput) => void
  onConfirmDelete: () => void
  isSubmitting: boolean
}
```

### `useDesignationsPageViewModel`
```ts
returns {
  designations: Designation[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedDepartmentFilter: string
  setSelectedDepartmentFilter: (id: string) => void
  filteredDesignations: Designation[]
  departments: Department[]          // for the filter dropdown
  selectedDesignation: Designation | null
  isFormModalOpen: boolean
  isDeleteModalOpen: boolean
  openAddModal: () => void
  openEditModal: (des: Designation) => void
  openDeleteModal: (des: Designation) => void
  closeModal: () => void
  onSubmit: (data: DesignationFormInput) => void
  onConfirmDelete: () => void
  isSubmitting: boolean
}
```

---

## Delete Guard

If a department or designation has `employeeCount > 0`, the delete modal must:
- Show a warning: "This department has X employees. Reassign them before deleting."
- Disable the confirm button

---

## Acceptance Criteria

1. Departments table lists all departments with head, count, and date.
2. Search filters results client-side without API call.
3. Add modal creates department and appends to list without full reload.
4. Edit modal pre-fills existing data.
5. Deleting a department with employees shows a warning and blocks deletion.
6. Designations filter by department correctly.
7. Designation form shows department dropdown populated from departments list.
8. Both pages show empty state when no records exist.
9. Success toast shows after create/edit/delete actions.
10. Department and designation lists used in Employee module dropdowns are invalidated
    and refetched after any mutation here.
