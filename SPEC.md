# AutoDev — Technical Spec

## Summary

AutoDev is a single-container web portal that lets users create software projects and watch them
build. Users pick a sample spec, the system creates a Cosmos DB record and a blob container,
and the portal streams build logs from that container as buildteam runs externally.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20 + TypeScript (strict) |
| Backend | Express — handles `/api/*` and serves the Vite-built SPA |
| Frontend | React 18 SPA, built with Vite |
| UI | shadcn/ui (Radix primitives) + Tailwind CSS + Lucide icons |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |
| Azure | `@azure/storage-blob`, `@azure/cosmos`, `@azure/identity` |
| Build | Vite (frontend), `tsc` (backend); outputs to `dist/` |

---

## Architecture

**Single container:** Express serves `dist/public` (Vite output) as static files and mounts API
routes at `/api`. No separate frontend host, no reverse proxy needed.

**Project layout:**
```
src/
  server/       # Express app, routes, Azure clients
  client/       # React SPA (Vite root)
    pages/      # One file per route
    components/ # Shared UI components
    lib/        # API client helpers, utils
dist/
  server/       # Compiled backend
  public/       # Vite frontend output (served as static)
```

**Dependency rule:** `client/` never imports from `server/`. Shared types live in `src/shared/`.

---

## Cross-Cutting Concerns

**Resource discovery:** Stamp ID from `STAMP_ID` env var (default `qqq`). Storage account =
`stautodev{STAMP_ID}`. Cosmos account = `cosmos-autodev-{STAMP_ID}`.

**Authentication:** `DefaultAzureCredential` for all Azure SDK calls — managed identity in
production, Azure CLI locally. No keys stored in code or config.

**Multi-tenancy:** Single-tenant for now. `organizationId` is hardcoded to `"default"` in all
Cosmos writes/queries. All queries include `organizationId` in the filter (single-partition).

**Error handling:** API routes return `{ error: string }` with appropriate HTTP status codes.
Frontend surfaces errors via Sonner toasts plus inline error states (never silent failures).

**Startup:** On boot, `createIfNotExists` ensures the `autodev` Cosmos database and `items`
container exist. Idempotent; safe to run on every restart.

---

## Acceptance Criteria

- **Dashboard:** Users can view all projects sorted by newest first; empty and error states shown.
- **New Project:** Users can create a project by naming it and picking a sample spec; creation
  provisions a Cosmos record and a blob container.
- **Log Viewer:** Users can view streaming build logs for a project with auto-scroll and manual
  pause/resume; empty and error states shown.
- **Sample Specs Admin:** Admins can list, upload, view, download, and delete sample spec
  markdown files from blob storage.
- **Responsive:** All pages work correctly on mobile (< 768px) and desktop (≥ 768px) using
  Tailwind responsive utilities only — no hardcoded pixel widths.
