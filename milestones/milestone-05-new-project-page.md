## Milestone: New Project Page

> **Validates:**
> - `GET /projects/new` renders a page titled "Create Project" (or similar heading) with a "Project Name" label, a text input, a "Sample Spec" label, a Select component, a "Create Project" submit button, and a "Cancel" button
> - When `GET /api/sample-specs` returns specs, the Select lists them (filename without `.md` extension); when it returns an empty array, the Select shows "No specs available" and the submit button is disabled
> - Submitting valid name + spec fires `POST /api/projects` and redirects to `/projects/:id`
> - Submitting with an empty name shows an inline validation error below the name field without calling the API
> - `GET /api/sample-specs` returns `200 []` (not `500`) when the `sample-specs` blob container does not yet exist
> - `POST /api/sample-specs` with a payload larger than 5 MB returns `413` (payload too large)

> **Reference files:**
> - `src/client/pages/DashboardPage.tsx` — page component pattern (useEffect fetch, loading/error/empty states, Sonner toasts, useNavigate)
> - `src/client/lib/api.ts` — API helper pattern (fetch, non-ok error throw)
> - `src/client/App.tsx` — route registration
> - `src/shared/types.ts` — shared types (`Project`, `SampleSpec`)
> - `src/server/lib/sampleSpecsService.ts` — service layer pattern (container client, blob operations)
> - `src/server/routes/sampleSpecs.ts` — multer upload route

---

- [ ] Add `fetchSampleSpecs()` helper to `src/client/lib/api.ts` — calls `GET /api/sample-specs`, returns `Promise<SampleSpec[]>`, throws `Error(body.error)` on non-ok response (same pattern as `fetchProjects`)
- [ ] Add `createProject()` helper to `src/client/lib/api.ts` — calls `POST /api/projects` with JSON body `{ name: string; specName: string }`, returns `Promise<Project>`, throws `Error(body.error)` on non-ok response
- [ ] Add shadcn/ui `form`, `input`, `label`, and `select` components — run `npx shadcn@latest add form input label select` in the project root to generate the component files in `src/client/components/ui/`
- [ ] Create `src/client/pages/NewProjectPage.tsx` — page scaffold with React Hook Form (`useForm`) and a Zod schema: `name` (required string, min 1, max 100 chars); `specName` (required non-empty string); fetches sample specs via `fetchSampleSpecs()` on mount; stores `specs`, `specsLoading`, and `specsError` state
- [ ] Add the name field and sample spec Select to `NewProjectPage` — name field: shadcn/ui `Input` auto-focused, inline error below on validation failure; spec Select: disabled with placeholder "Loading specs…" while `specsLoading`; when specs are empty shows "No specs available — upload specs in Admin first" as a muted paragraph and disables the submit button; when populated, each `SelectItem` shows the filename without the `.md` extension and its value is the full filename (e.g. `"minimal-node-api.md"`)
- [ ] Add form submit and action buttons to `NewProjectPage` — `handleSubmit` calls `createProject({ name, specName })`; while submitting, the "Create Project" button is disabled and shows a `Loader2` spinner icon; on success navigates to `/projects/${project.id}`; on error calls `toast.error(...)`; the "Cancel" button always navigates to `/`; page heading: "New Project"
- [ ] Register `NewProjectPage` in `src/client/App.tsx` — replace the placeholder `<div>New Project</div>` on route `/projects/new` with `<NewProjectPage />`; add the import
- [ ] Guard `listSampleSpecs` against a missing container in `src/server/lib/sampleSpecsService.ts` — wrap the `listBlobsFlat` iteration in a `try/catch`; if `(err as { statusCode?: number }).statusCode === 404` or `(err as { code?: string }).code === 'ContainerNotFound'` return an empty array; re-throw all other errors (fixes finding #33)
- [ ] Add a file-size limit to the multer config in `src/server/routes/sampleSpecs.ts` — change `multer({ storage: multer.memoryStorage() })` to `multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })` (5 MB cap) (fixes finding #37)
