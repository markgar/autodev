## Milestone: New Project Page — Foundation

> **Validates:**
> - `GET /api/sample-specs` returns `200 []` (not `500`) when the `sample-specs` blob container does not yet exist
> - `POST /api/sample-specs` with a payload larger than 5 MB returns `413` (payload too large)

> **Reference files:**
> - `src/client/lib/api.ts` — API helper pattern (fetch, non-ok error throw)
> - `src/shared/types.ts` — shared types (`Project`, `SampleSpec`)
> - `src/server/lib/sampleSpecsService.ts` — service layer pattern (container client, blob operations)
> - `src/server/routes/sampleSpecs.ts` — multer upload route

---

- [x] Add `fetchSampleSpecs()` helper to `src/client/lib/api.ts` — calls `GET /api/sample-specs`, returns `Promise<SampleSpec[]>`, throws `Error(body.error)` on non-ok response (same pattern as `fetchProjects`)
- [x] Add `createProject()` helper to `src/client/lib/api.ts` — calls `POST /api/projects` with JSON body `{ name: string; specName: string }`, returns `Promise<Project>`, throws `Error(body.error)` on non-ok response
- [x] Add shadcn/ui `form`, `input`, `label`, and `select` components — run `npx shadcn@latest add form input label select` in the project root to generate the component files in `src/client/components/ui/`
- [ ] Guard `listSampleSpecs` against a missing container in `src/server/lib/sampleSpecsService.ts` — wrap the `listBlobsFlat` iteration in a `try/catch`; if `(err as { statusCode?: number }).statusCode === 404` or `(err as { code?: string }).code === 'ContainerNotFound'` return an empty array; re-throw all other errors (fixes finding #33)
- [ ] Add a file-size limit to the multer config in `src/server/routes/sampleSpecs.ts` — change `multer({ storage: multer.memoryStorage() })` to `multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })` (5 MB cap) (fixes finding #37)
