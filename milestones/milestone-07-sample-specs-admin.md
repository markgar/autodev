## Milestone: Sample Specs Admin

> **Validates:**
> - `GET /api/sample-specs` → 200 with JSON array of `{ name, size, lastModified }` objects
> - `POST /api/sample-specs` with a `.md` file (multipart form-data, field `file`) → 201 `{ name }`; file > 1 MB → 413
> - `GET /api/sample-specs/:name` → 200 `{ name, content }` for an existing spec; unknown name → 404
> - `DELETE /api/sample-specs/:name` → 204 for an existing spec
> - Browser `GET /admin/sample-specs` → SPA loads and renders the Sample Specs Admin page (heading "Sample Specs" is present in the DOM)

> **Reference files:**
> - Page pattern: `src/client/pages/DashboardPage.tsx` (table + card layout, loading/empty/error states, Sonner toasts)
> - API helpers: `src/client/lib/api.ts` (fetch wrappers, error handling shape)
> - Utilities: `src/client/lib/utils.ts` (`cn()` helper — add `formatFileSize` here)
> - Server route: `src/server/routes/sampleSpecs.ts` (existing sample-specs API — thin handlers, multer upload)
> - Routing: `src/client/App.tsx` (BrowserRouter + AppLayout, register new page here)

- [ ] Fix bug: set `MAX_UPLOAD_BYTES = 1 * 1024 * 1024` (1 MB) and update the 413 error message to "File too large (max 1 MB)" in `src/server/routes/sampleSpecs.ts` (reverts the merge-conflict regression from issue #53)

- [ ] Add `formatFileSize(bytes: number): string` helper to `src/client/lib/utils.ts` — converts bytes to human-readable string (e.g. `1023` → `"1,023 B"`, `12400` → `"12.1 KB"`, `1500000` → `"1.4 MB"`)

- [ ] Add `fetchSampleSpecContent(name: string): Promise<{ name: string; content: string }>`, `uploadSampleSpec(file: File): Promise<{ name: string }>`, and `deleteSampleSpec(name: string): Promise<void>` API helpers to `src/client/lib/api.ts` following the existing fetch-wrapper pattern (throw Error on non-ok, parse `{ error }` body)

- [ ] Create `src/client/pages/SampleSpecsAdminPage.tsx` with a `loadSpecs` function that calls `fetchSampleSpecs`, `specs` / `loading` / `error` state, loading skeleton (5 `<Skeleton>` rows), empty state ("No sample specs uploaded yet. Click Upload to add your first spec."), and error state (Sonner toast + inline "Failed to load specs" paragraph + "Retry" Button)

- [ ] Add desktop table to `SampleSpecsAdminPage` (`hidden md:block`): columns **Filename**, **Size** (via `formatFileSize`), **Last Modified** (via `formatDate`), **Actions**; one row per spec with `border-b hover:bg-accent` styling

- [ ] Add mobile card list to `SampleSpecsAdminPage` (`block md:hidden`): one card per spec with filename bold on top, size + last-modified on second line, action icon buttons (`Eye` and `Trash2`) in a row at the bottom; `min-h-[44px]` touch target on action buttons

- [ ] Add Upload button in the page heading row of `SampleSpecsAdminPage`: clicking it triggers a hidden `<input type="file" accept=".md" multiple ref={fileInputRef}>` via `fileInputRef.current?.click()`; on change, calls `uploadSampleSpec` for each selected file sequentially, shows `toast.success("Uploaded {filename}")` per file or `toast.error(...)` on failure, then calls `loadSpecs()` to refresh; button shows a `<Loader2>` spinner while any upload is in progress

- [ ] Add Delete AlertDialog to `SampleSpecsAdminPage` using shadcn/ui `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`; description text: "Delete {name}? This cannot be undone."; on confirm calls `deleteSampleSpec(name)`, shows `toast.success("Deleted {name}")`, then calls `loadSpecs()`; the trash icon button is disabled with a `<Loader2>` spinner while the delete for that row is in progress (track per-name deleting state with a `Set<string>`)

- [ ] Add View modal to `SampleSpecsAdminPage` using shadcn/ui `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`; opening the eye icon calls `fetchSampleSpecContent(name)` and stores content in state; modal body is a `<pre className="font-mono text-sm overflow-y-auto max-h-[70vh] whitespace-pre-wrap break-all">` block; footer has a "Download" button that creates a `Blob` from the content, generates an object URL, and triggers a `<a download={name}>` click, and a "Close" button; `DialogContent` uses `className="sm:max-w-2xl w-full"` for desktop/mobile sizing

- [ ] Register `SampleSpecsAdminPage` in `src/client/App.tsx`: replace the `<div>Sample Specs</div>` placeholder at `/admin/sample-specs` with `<SampleSpecsAdminPage />`

- [ ] Fix `src/client/pages/DashboardPage.test.tsx` navigation tests: replace `await waitFor(() => screen.getByRole('button', { name: 'New Project' })); fireEvent.click(screen.getByRole('button', ...))` with `const btn = await screen.findByRole('button', { name: 'New Project' }); fireEvent.click(btn)` (issue #56)

- [ ] Fix `src/client/pages/DashboardPage.test.tsx` sorting test: replace the `getAllByText(/App/)` selector with `screen.getAllByRole('cell').filter(...)` or look up rows via `getAllByRole('row')` slicing the header row, then assert `.textContent` of the name cell — ensuring the selector is scoped to the table body and cannot match unrelated elements (issue #55)
