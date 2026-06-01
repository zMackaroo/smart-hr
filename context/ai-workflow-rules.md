# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. Context files define
what to build, how to build it, and the current state of progress. Always implement
against these specs — do not infer or invent behaviour from scratch.

Each spec lives in `specs/` as a numbered file (e.g. `01-spec-auth.md`,
`02-spec-employees.md`). Read the relevant spec before implementing any unit.

## Scoping Rules

- Work on one feature unit at a time (e.g. "Employee Grid page", not "all of HR").
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step.
- One PR / one session = one spec unit.

## When to Split Work

Split an implementation step if it combines:

- UI changes and API layer changes (do API layer first, UI second)
- Multiple unrelated page modules (e.g. Leaves and Payroll in one step)
- Behaviour not clearly defined in the spec files
- More than one new Zustand store
- Both a new page and changes to the routing config (route config first, page second)

If a change cannot be verified end-to-end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behaviour not defined in the spec or context files.
- If a requirement is ambiguous, resolve it in the relevant spec file before
  implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md`
  before continuing.
- If a UI detail is not in the spec, default to `ui-context.md` patterns.

## Implementation Order per Feature Unit

1. Define / confirm types in `src/types/`
2. Write API function(s) in `src/api/`
3. Write the ViewModel hook
4. Write the View (Page)
5. Wire route in `src/router/routes.tsx`
6. Add sidebar nav entry if needed
7. Verify end-to-end in browser
8. Update `progress-tracker.md`

## Protected Files

Do not modify without explicit instruction:

- `src/components/ui/*` — primitive UI library components
- `tailwind.config.ts` — unless adding a documented design token
- Any third-party library internals

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries → `architecture.md`
- New design token or component pattern → `ui-context.md`
- New code convention → `code-standards.md`
- Feature scope change → `project-overview.md` and the relevant spec
- Any progress → `progress-tracker.md`

## Spec Format (`specs/NN-spec-<module>.md`)

Each spec must include:

- **Goal** — what this unit delivers
- **Routes** — URL paths
- **Components** — list of View + ViewModel + page-local components
- **Store / State** — Zustand store shape (if new)
- **API Endpoints** — method, path, request, response
- **Zod Schemas** — type definitions
- **UI Notes** — reference to ui-context.md patterns or specific deviations
- **Acceptance Criteria** — verifiable conditions the unit must meet

## Before Moving to the Next Unit

1. The current unit works end-to-end within its defined scope.
2. No invariant defined in `architecture.md` was violated.
3. `progress-tracker.md` reflects the completed work.
4. `npm run build` passes with zero TypeScript errors.
5. No `any` types introduced.
