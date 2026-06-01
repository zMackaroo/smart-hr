# Spec 24 — Projects, Tasks & Daily Reports (Phase 3)

## Goal

Introduce lightweight project and task tracking for teams, enabling the deferred
**Daily / Project / Task reports** from `project-overview.md` and Spec 12.

**Phase 3 spec — future backlog.** Requires net-new modules not present in Specs 01–16.

---

## Routes (proposed)

| Path               | Page           | Role                              |
| ------------------ | -------------- | --------------------------------- |
| `/projects`        | `ProjectsPage` | hr_admin, super_admin, employee   |
| `/projects/:id`    | `ProjectDetailPage` | hr_admin, super_admin, employee |
| `/tasks`           | `TasksPage`    | hr_admin, super_admin, employee   |

---

## Core Entities

- **Project** — name, description, status, owner, members, date range
- **Task** — title, assignee, project, status, due date, logged hours
- **Time log** — daily hours entry against task (feeds Daily Report)

---

## Reports Integration

Enable in Spec 12:
- `daily` report — hours by employee/date
- `project` report — tasks/hours by project
- `task` report — completion status by assignee

---

## Acceptance Criteria (high level)

1. Admin creates project and assigns members.
2. Employee logs time against assigned tasks.
3. Daily/Project/Task reports generate from task store.
4. `npm run build` passes after implementation.

---

## Dependencies

- Spec 19 (permissions for new modules)
- Spec 22 (if multi-company — projects scoped per company)
