# Spec 23 — Custom Roles (Phase 2)

## Goal

Extend Spec 14 to support custom role creation beyond the three system roles
(`super_admin`, `hr_admin`, `employee`). Super Admin creates named roles with
permission matrices and assigns them to users (Spec 15).

**Phase 2 spec — depends on Spec 19 (permission-driven UI).**

---

## Architecture Decisions

- **System roles** remain non-deletable; custom roles can be created/edited/deleted.
- **Custom role slug** — auto-generated (`custom-{uuid}`); display name user-defined.
- **User assignment** — `PlatformUser.role` becomes `roleId` reference OR extends enum with dynamic lookup table.
- **Minimum guard** — cannot delete role with assigned users; cannot remove last super_admin access path.

Recommended model change:
```ts
export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),              // super_admin | hr_admin | employee | custom-*
  isSystem: z.boolean(),
  // ...permissions unchanged
})
```

Update `AuthUser.role` to remain enum for system roles + optional `customRoleId` in Phase 2.

---

## Routes

| Path               | Page                    | Role        |
| ------------------ | ----------------------- | ----------- |
| `/settings/roles`  | `RolesPermissionsPage`  | super_admin |

Enhance existing page (no new route):
- `[+ Add Role]` button
- Delete custom role (with user-count guard)
- Duplicate role as template

---

## UI Changes

### RoleListPanel
- System roles: badge "System"
- Custom roles: badge "Custom" + delete icon
- Add Role modal: name, description, clone permissions from existing role

### Users (Spec 15)
- Role dropdown includes custom roles

---

## Acceptance Criteria

1. Super Admin can create custom role with permission matrix.
2. Custom role appears in Users role assignment dropdown.
3. Users with custom role inherit permissions in `canModule()` checks.
4. System roles cannot be deleted or renamed.
5. Cannot delete custom role with assigned users.
6. `npm run build` passes after implementation.

---

## Out of Scope

- Per-user permission overrides
- Role hierarchy / inheritance
