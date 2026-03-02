## Milestone: Project Detail & Log Viewer

> **Validates:**
> - `GET /api/projects/:id` returns 200 with a project JSON object (id, name, createdAt, etc.) when the project exists; returns 404 `{ error: "Project not found" }` when it does not
> - `GET /api/projects/:id/logs` returns 200 with `{ lines: [] }` (empty array is valid when no log blobs exist)
> - Navigating to `/projects/:id` in a browser renders the project detail page — NOT the placeholder `<div>Project Detail</div>`; the page shows the project name as a heading, a "Back to Dashboard" link, and a log viewer area
> - Navigating to `/projects/nonexistent-id` renders an error/not-found state rather than crashing the page

> **Reference files:**
> - `src/client/pages/DashboardPage.tsx` — exemplar page: loading/error/empty states, Skeleton, Sonner toast, state management with `useState`/`useEffect`
> - `src/client/lib/api.ts` — API client helpers: fetch wrapper pattern, error extraction, `formatDate`
> - `src/client/App.tsx` — React Router route registration; replace the `/projects/:id` placeholder route
> - `src/server/routes/projects.ts` — existing `GET /:id` and `GET /:id/logs` route handlers (already implemented — no server changes needed)
> - `src/server/lib/logsService.ts` — logs service returning `string[]` (already implemented — no server changes needed)
> - `src/shared/types.ts` — `Project` type shared between client and server

- [x] Add `fetchProject(id: string): Promise<Project>` helper to `src/client/lib/api.ts` that calls `GET /api/projects/:id` and throws on non-ok response using the same `body.error ?? \`HTTP ${res.status}\`` pattern as existing helpers

- [x] Add `fetchProjectLogs(id: string): Promise<string[]>` helper to `src/client/lib/api.ts` that calls `GET /api/projects/:id/logs`, extracts the `lines` array from the `{ lines: string[] }` response body, and throws on non-ok response

- [x] Create `src/client/pages/ProjectDetailPage.tsx` with the project header: use `useParams<{ id: string }>()` to get the project ID; fetch project with `fetchProject` on mount; show a `<Loader2 className="animate-spin" />` spinner during initial load; show an inline error message with a Retry button if the fetch fails; show "Project not found" if the API returns 404; on success render: a `<Link to="/">← Back to Dashboard</Link>` above the heading, the project name as `<h1 className="text-2xl font-bold">`, and the created date below in `<p className="text-sm text-muted-foreground">` using `formatDate`

- [x] Add the log viewer container to `ProjectDetailPage`: a `<div ref={scrollRef}>` with `className="relative bg-zinc-900 text-zinc-100 rounded-lg border font-mono text-xs md:text-sm p-4 overflow-y-auto h-[calc(100vh-12rem)]"`; render each line as a `<div key={i} className="whitespace-pre-wrap break-all">{line}</div>`; show "Loading logs…" with a `<Loader2>` spinner on the first load; show "No logs yet — logs will appear here when a build runs." when `lines` is an empty array and not loading; show "Could not load logs" with a Retry button when the logs fetch fails

- [x] Add polling to `ProjectDetailPage`: `useState` for `lines: string[]`, `logsLoading: boolean`, `logsError: string | null`, `polling: boolean` (default `true`); on mount call `fetchProjectLogs` immediately and set `logsLoading` to `false` after; use `useEffect` with a `setInterval` of 7000 ms that calls `fetchProjectLogs` and updates `lines` silently (no loading spinner for poll refreshes) when `polling === true`; clear the interval on cleanup with `clearInterval`

- [x] Add auto-scroll behavior to `ProjectDetailPage`: `const scrollRef = useRef<HTMLDivElement>(null)` and `const [autoScroll, setAutoScroll] = useState(true)`; `useEffect` that runs when `lines` changes: if `autoScroll === true`, call `scrollRef.current.scrollTop = scrollRef.current.scrollHeight`; attach a `scroll` event listener on `scrollRef.current` that sets `autoScroll = false` when `el.scrollTop + el.clientHeight < el.scrollHeight - 2`, and sets `autoScroll = true` when the user has scrolled back to within 2px of the bottom; remove the listener on cleanup

- [x] Add the Pause/Resume button and pulsing dot indicator inside the log viewer: absolutely positioned in the top-right corner of the log viewer with `className="absolute top-2 right-2 flex items-center gap-2"`; a `<span className={\`w-2 h-2 rounded-full \${polling ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}\`} />`; a `<Button size="sm" variant="ghost" className="h-7 px-2 text-zinc-100 hover:text-white hover:bg-zinc-700">` that shows `<Pause className="h-3 w-3 mr-1" /> Pause` when `polling === true` and `<Play className="h-3 w-3 mr-1" /> Resume` when `polling === false`; clicking toggles the `polling` state

- [x] Register `ProjectDetailPage` in `src/client/App.tsx`: import `{ ProjectDetailPage }` from `@/pages/ProjectDetailPage` and replace `<div>Project Detail</div>` with `<ProjectDetailPage />` on the `path="/projects/:id"` route
