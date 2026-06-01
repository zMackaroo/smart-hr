# Spec 18 — Org Chart

## Goal

Build an interactive organisational chart visualising reporting hierarchy from
employee `managerId` relationships (Spec 05). HR Admins and Super Admins explore
the company structure; employees see their own subtree (self + reports if manager,
plus chain up to CEO/root).

**Implementation note:** Implement in order: (1) org tree API from employee store,
(2) static tree/chart component, (3) page with filters and detail panel. Use a
lightweight CSS/flex tree layout in v1 — no D3 required unless layout proves
too complex.

**Architecture decision:** Org chart is read-only in v1. Manager changes happen
via Employee edit (Spec 05 Work tab). Circular manager references must be
detected and excluded from tree build with a console warning in dev.

Resolves the **Org chart** item in `project-overview.md` (listed under Core HR but
never specced in 01–16).

---

## Routes

| Path          | Page           | Role                              |
| ------------- | -------------- | --------------------------------- |
| `/org-chart`  | `OrgChartPage` | hr_admin, super_admin, employee   |

Employee view: centred on logged-in employee node; can expand up/down within allowed scope.

---

## File Structure

```
src/
├── pages/
│   └── OrgChart/
│       ├── OrgChartPage.tsx
│       ├── OrgChartPage.viewmodel.ts
│       └── components/
│           ├── OrgChartTree.tsx
│           ├── OrgChartNode.tsx
│           ├── OrgChartDetailPanel.tsx
│           ├── OrgChartFilters.tsx
│           └── OrgChartEmptyState.tsx
├── api/
│   └── org-chart.api.ts
└── types/
    └── org-chart.types.ts
```

Update `src/config/navigation.config.ts` — add "Org Chart" under HR section.

---

## Zod Schemas & Types (`org-chart.types.ts`)

```ts
export const OrgChartNodeSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  name: z.string(),
  avatarUrl: z.string().optional(),
  designation: z.string(),
  department: z.string(),
  departmentId: z.string(),
  managerId: z.string().optional(),
  status: z.enum(['active', 'on_leave', 'terminated']),
  directReportsCount: z.number(),
  children: z.lazy(() => z.array(OrgChartNodeSchema)).optional(),
})

export const OrgChartTreeSchema = z.object({
  roots: z.array(OrgChartNodeSchema),
  totalNodes: z.number(),
  orphanedNodes: z.number(),   // employees with invalid managerId
})
```

---

## API Functions (`org-chart.api.ts`)

```ts
getOrgChartTree(params?: {
  departmentId?: string
  rootEmployeeId?: string   // focus subtree from this node
  maxDepth?: number         // default 4
}): Promise<OrgChartTree>

getOrgChartNode(employeeId: string): Promise<OrgChartNode>

getEmployeeChain(employeeId: string): Promise<OrgChartNode[]>
  // returns path from root → employee (for employee scoped view)
```

**Tree build rules:**
- Source: `employees.api.ts` store (`managerId`, `managerName`).
- Root nodes: employees with no `managerId` OR manager not in store.
- Inactive/terminated employees shown greyed out; filter option to hide terminated.
- Seed data already has `managerId` on several employees — ensure enough hierarchy depth (≥3 levels).

---

## UI Notes

Follow patterns in `ui-context.md`:
- Desktop: chart canvas (scrollable) + right detail panel (300px).
- Mobile: vertical list fallback (indented tree) when viewport < 768px.
- Node card: avatar, name, designation, department badge, direct-reports count.

---

## Page UI

### Page Header
- Title: "Org Chart"
- Breadcrumbs: `[HR] → [Org Chart]`

### Filter Bar (`OrgChartFilters`)
- Department dropdown (All / specific dept)
- `[Expand All]` / `[Collapse All]` toggles
- Search employee (highlights + scrolls to node)

### Chart Canvas (`OrgChartTree`)
- Top-down hierarchy with connecting lines (CSS borders or SVG)
- Click node → selects and opens detail panel
- Selected node: accent border
- Zoom controls (optional v1: horizontal scroll only)

### Detail Panel (`OrgChartDetailPanel`)
- Employee avatar, name, ID, designation, department
- Manager name (link to select manager node)
- Direct reports list (clickable)
- `[View Profile]` → `/employees/:id`

### Empty State
- "No reporting hierarchy configured" when all employees are roots with no children.

### Employee Scoped View
- Auto-focus on current user's node.
- Show ancestors (up to root) + self + direct reports (1 level down).
- Banner: "Showing your team hierarchy"

---

## ViewModel Hook

### `useOrgChartPageViewModel`
```ts
returns {
  tree: OrgChartTree | undefined
  isLoading: boolean
  selectedNode: OrgChartNode | null
  setSelectedNode: (node: OrgChartNode | null) => void
  departmentFilter: string
  setDepartmentFilter: (id: string) => void
  departments: Array<{ id: string; name: string }>
  searchQuery: string
  setSearchQuery: (q: string) => void
  highlightedNodeId: string | null
  isAdmin: boolean
  expandAll: () => void
  collapseAll: () => void
}
```

---

## Route Guards & Nav

- Route `/org-chart` → all authenticated roles.
- Nav: HR section — "Org Chart" → `/org-chart`
  - Roles: `super_admin`, `hr_admin`, `employee`

---

## Acceptance Criteria

1. Admin sees full org tree built from employee manager relationships.
2. Employee sees scoped view centred on their node.
3. Department filter limits visible nodes to selected department (node + ancestors kept for context).
4. Clicking a node opens detail panel with profile link.
5. Terminated employees visually distinct; optional hide filter works.
6. Circular manager references do not crash tree builder.
7. Search highlights and scrolls to matching employee node.
8. Mobile layout renders usable indented list fallback.
9. `npm run build` passes with zero TypeScript errors after implementation.
