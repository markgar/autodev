## Milestone: Dashboard — States & Responsive Layout

> **Validates:**
> - When the API returns an empty array from `GET /api/projects`, the page shows "No projects yet" and a "Create your first project" button
> - On desktop (≥ 768px), projects are rendered as an HTML `<table>`; on mobile (< 768px), as stacked cards
> - A loading skeleton is visible while `GET /api/projects` is in flight
> - When `GET /api/projects` returns an error, an inline "Failed to load projects" message appears with a "Retry" button

> **Reference files:**
> - `src/client/pages/DashboardPage.tsx` — page component (created in milestone-04a)
> - `src/client/lib/api.ts` — fetch helpers (created in milestone-04a)
> - `src/shared/types.ts` — shared TypeScript types (`Project`)

---

- [x] Add loading skeleton to `DashboardPage` — render 3–5 `Skeleton` rows (shadcn/ui `Skeleton` component) while the fetch is in flight
- [x] Add empty state to `DashboardPage` — when the project list is empty, render a centered "No projects yet" message and a "Create your first project" button that navigates to `/projects/new`
- [x] Add error state to `DashboardPage` — when the fetch fails, fire a Sonner `toast.error(...)` and render inline "Failed to load projects" text with a "Retry" button that re-triggers the fetch
- [x] Add desktop table to `DashboardPage` — hidden on mobile (`hidden md:block`); renders an HTML `<table>` with columns "Name" and "Created"; each row is wrapped in a `<tr>` with an `onClick` that navigates to `/projects/:id`; projects sorted by `createdAt` descending
- [ ] Add mobile card list to `DashboardPage` — visible only on mobile (`block md:hidden`); renders one `<div>` card per project showing the name (bold) and created date; each card is tappable and navigates to `/projects/:id`; min-height 44px for touch targets
