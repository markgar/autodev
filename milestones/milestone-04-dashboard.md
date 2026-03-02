## Milestone: Dashboard — Projects List Page

> **Validates:**
> - `GET /` renders the React SPA (HTTP 200) with page heading "Projects"
> - When the API returns an empty array from `GET /api/projects`, the page shows "No projects yet" and a "Create your first project" button
> - "New Project" button is present and navigates to `/projects/new`
> - On desktop (≥ 768px), projects are rendered as an HTML `<table>`; on mobile (< 768px), as stacked cards
> - A loading skeleton is visible while `GET /api/projects` is in flight
> - When `GET /api/projects` returns an error, an inline "Failed to load projects" message appears with a "Retry" button
> - Each project row/card links to `/projects/:id`

> **Reference files:**
> - `src/client/components/AppLayout.tsx` — layout and sidebar patterns
> - `src/shared/types.ts` — shared TypeScript types (`Project`)
> - `src/server/routes/projects.ts` — `GET /api/projects` endpoint shape
> - `src/client/App.tsx` — routing registration pattern

---

- [ ] Create `src/client/lib/api.ts` — typed fetch helpers: `fetchProjects(): Promise<Project[]>` that calls `GET /api/projects` and throws on non-OK responses
- [ ] Create `src/client/pages/DashboardPage.tsx` — page component with three states: loading (skeleton), error (inline message + Retry button + Sonner toast), and data loaded; fetches on mount using `fetchProjects()`
- [ ] Add loading skeleton to `DashboardPage` — render 3–5 `Skeleton` rows (shadcn/ui `Skeleton` component) while the fetch is in flight
- [ ] Add empty state to `DashboardPage` — when the project list is empty, render a centered "No projects yet" message and a "Create your first project" button that navigates to `/projects/new`
- [ ] Add error state to `DashboardPage` — when the fetch fails, fire a Sonner `toast.error(...)` and render inline "Failed to load projects" text with a "Retry" button that re-triggers the fetch
- [ ] Add desktop table to `DashboardPage` — hidden on mobile (`hidden md:block`); renders an HTML `<table>` with columns "Name" and "Created"; each row is wrapped in a `<tr>` with an `onClick` that navigates to `/projects/:id`; projects sorted by `createdAt` descending
- [ ] Add mobile card list to `DashboardPage` — visible only on mobile (`block md:hidden`); renders one `<div>` card per project showing the name (bold) and created date; each card is tappable and navigates to `/projects/:id`; min-height 44px for touch targets
- [ ] Add "Created" date formatting helper in `src/client/lib/api.ts` — `formatDate(iso: string): string` returns a human-readable relative time string using `Intl.RelativeTimeFormat` (e.g., "2 hours ago", "3 days ago")
- [ ] Add page header row to `DashboardPage` — "Projects" heading (`<h1>`) left-aligned and "New Project" button right-aligned on the same row; button navigates to `/projects/new` using React Router `useNavigate`
- [ ] Register `DashboardPage` in `src/client/App.tsx` — replace the `<div>Dashboard</div>` placeholder at `path="/"` with `<DashboardPage />`
