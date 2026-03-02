## Milestone: Sample Specs – Backend, Utilities & Test Fixes

> **Validates:**
> - `GET /api/sample-specs` → 200 with JSON array of `{ name, size, lastModified }` objects
> - `POST /api/sample-specs` with a `.md` file (multipart form-data, field `file`) → 201 `{ name }`; file > 1 MB → 413
> - `GET /api/sample-specs/:name` → 200 `{ name, content }` for an existing spec; unknown name → 404
> - `DELETE /api/sample-specs/:name` → 204 for an existing spec

> **Reference files:**
> - API helpers: `src/client/lib/api.ts` (fetch wrappers, error handling shape)
> - Utilities: `src/client/lib/utils.ts` (`cn()` helper — add `formatFileSize` here)
> - Server route: `src/server/routes/sampleSpecs.ts` (existing sample-specs API — thin handlers, multer upload)

- [x] Fix bug: set `MAX_UPLOAD_BYTES = 1 * 1024 * 1024` (1 MB) and update the 413 error message to "File too large (max 1 MB)" in `src/server/routes/sampleSpecs.ts` (reverts the merge-conflict regression from issue #53)

- [x] Add `formatFileSize(bytes: number): string` helper to `src/client/lib/utils.ts` — converts bytes to human-readable string (e.g. `1023` → `"1,023 B"`, `12400` → `"12.1 KB"`, `1500000` → `"1.4 MB"`)

- [x] Add `fetchSampleSpecContent(name: string): Promise<{ name: string; content: string }>`, `uploadSampleSpec(file: File): Promise<{ name: string }>`, and `deleteSampleSpec(name: string): Promise<void>` API helpers to `src/client/lib/api.ts` following the existing fetch-wrapper pattern (throw Error on non-ok, parse `{ error }` body)

- [x] Fix `src/client/pages/DashboardPage.test.tsx` navigation tests: replace `await waitFor(() => screen.getByRole('button', { name: 'New Project' })); fireEvent.click(screen.getByRole('button', ...))` with `const btn = await screen.findByRole('button', { name: 'New Project' }); fireEvent.click(btn)` (issue #56)

- [ ] Fix `src/client/pages/DashboardPage.test.tsx` sorting test: replace the `getAllByText(/App/)` selector with `screen.getAllByRole('cell').filter(...)` or look up rows via `getAllByRole('row')` slicing the header row, then assert `.textContent` of the name cell — ensuring the selector is scoped to the table body and cannot match unrelated elements (issue #55)
