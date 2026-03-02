## Milestone: Dashboard — API Layer & Page Scaffold

> **Validates:**
> - `GET /` renders the React SPA (HTTP 200) with page heading "Projects"
> - "New Project" button is present and navigates to `/projects/new`
> - Each project row/card links to `/projects/:id`

> **Reference files:**
> - `src/client/components/AppLayout.tsx` — layout and sidebar patterns
> - `src/shared/types.ts` — shared TypeScript types (`Project`)
> - `src/server/routes/projects.ts` — `GET /api/projects` endpoint shape
> - `src/client/App.tsx` — routing registration pattern

---

- [x] Create `src/client/lib/api.ts` — typed fetch helpers: `fetchProjects(): Promise<Project[]>` that calls `GET /api/projects` and throws on non-OK responses
- [x] Add "Created" date formatting helper in `src/client/lib/api.ts` — `formatDate(iso: string): string` returns a human-readable relative time string using `Intl.RelativeTimeFormat` (e.g., "2 hours ago", "3 days ago")
- [x] Create `src/client/pages/DashboardPage.tsx` — page component with three states: loading (skeleton), error (inline message + Retry button + Sonner toast), and data loaded; fetches on mount using `fetchProjects()`
- [x] Add page header row to `DashboardPage` — "Projects" heading (`<h1>`) left-aligned and "New Project" button right-aligned on the same row; button navigates to `/projects/new` using React Router `useNavigate`
- [ ] Register `DashboardPage` in `src/client/App.tsx` — replace the `<div>Dashboard</div>` placeholder at `path="/"` with `<DashboardPage />`
