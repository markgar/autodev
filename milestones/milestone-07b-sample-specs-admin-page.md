## Milestone: Sample Specs – Admin Page

> **Validates:**
> - Browser `GET /admin/sample-specs` → SPA loads and renders the Sample Specs Admin page (heading "Sample Specs" is present in the DOM)

> **Reference files:**
> - Page pattern: `src/client/pages/DashboardPage.tsx` (table + card layout, loading/empty/error states, Sonner toasts)
> - Routing: `src/client/App.tsx` (BrowserRouter + AppLayout, register new page here)

> **Depends on:** milestone-07a (backend fixes, `formatFileSize`, and API helpers must be in place first)

- [x] Create `src/client/pages/SampleSpecsAdminPage.tsx` with a `loadSpecs` function that calls `fetchSampleSpecs`, `specs` / `loading` / `error` state, loading skeleton (5 `<Skeleton>` rows), empty state ("No sample specs uploaded yet. Click Upload to add your first spec."), and error state (Sonner toast + inline "Failed to load specs" paragraph + "Retry" Button)

- [x] Add desktop table to `SampleSpecsAdminPage` (`hidden md:block`): columns **Filename**, **Size** (via `formatFileSize`), **Last Modified** (via `formatDate`), **Actions**; one row per spec with `border-b hover:bg-accent` styling

- [x] Add mobile card list to `SampleSpecsAdminPage` (`block md:hidden`): one card per spec with filename bold on top, size + last-modified on second line, action icon buttons (`Eye` and `Trash2`) in a row at the bottom; `min-h-[44px]` touch target on action buttons

- [x] Add Upload button in the page heading row of `SampleSpecsAdminPage`: clicking it triggers a hidden `<input type="file" accept=".md" multiple ref={fileInputRef}>` via `fileInputRef.current?.click()`; on change, calls `uploadSampleSpec` for each selected file sequentially, shows `toast.success("Uploaded {filename}")` per file or `toast.error(...)` on failure, then calls `loadSpecs()` to refresh; button shows a `<Loader2>` spinner while any upload is in progress

- [x] Add Delete AlertDialog to `SampleSpecsAdminPage` using shadcn/ui `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`; description text: "Delete {name}? This cannot be undone."; on confirm calls `deleteSampleSpec(name)`, shows `toast.success("Deleted {name}")`, then calls `loadSpecs()`; the trash icon button is disabled with a `<Loader2>` spinner while the delete for that row is in progress (track per-name deleting state with a `Set<string>`)

- [ ] Add View modal to `SampleSpecsAdminPage` using shadcn/ui `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`; opening the eye icon calls `fetchSampleSpecContent(name)` and stores content in state; modal body is a `<pre className="font-mono text-sm overflow-y-auto max-h-[70vh] whitespace-pre-wrap break-all">` block; footer has a "Download" button that creates a `Blob` from the content, generates an object URL, and triggers a `<a download={name}>` click, and a "Close" button; `DialogContent` uses `className="sm:max-w-2xl w-full"` for desktop/mobile sizing

- [ ] Register `SampleSpecsAdminPage` in `src/client/App.tsx`: replace the `<div>Sample Specs</div>` placeholder at `/admin/sample-specs` with `<SampleSpecsAdminPage />`
