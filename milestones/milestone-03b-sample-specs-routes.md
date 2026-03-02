# Milestone: Sample Specs API — Route Handlers

> **Validates:**
> - `GET /api/health` returns HTTP 200 (app still boots)
> - `GET /api/sample-specs` returns HTTP 200 with a JSON array (may be empty: `[]`)
> - `POST /api/sample-specs` with a multipart form-data field `file` containing a `.md` file returns HTTP 201
> - `GET /api/sample-specs/<uploaded-name>` returns HTTP 200 with `{ name, content }` after upload
> - `DELETE /api/sample-specs/<uploaded-name>` returns HTTP 204 after upload
> - `GET /api/sample-specs/does-not-exist.md` returns HTTP 404

> **Reference files:**
> - `src/server/lib/logsService.ts` — blob storage access pattern (service layer using `getBlobServiceClient()`)
> - `src/server/routes/projects.ts` — route handler pattern (Zod validation, `{ error }` envelope, thin handler delegating to service)
> - `src/server/routes/index.ts` — router mounting (where to add the new `sampleSpecsRouter`)
> - `src/shared/types.ts` — `SampleSpec` type already defined here; no new type needed

> **Depends on:** milestone-03a-sample-specs-service (service layer must be complete first)

---

- [x] Create `src/server/routes/sampleSpecs.ts` with a `GET /` handler that calls `listSampleSpecs()` and returns the array as JSON; 500 on error
- [x] Add `GET /:name` handler to `sampleSpecs.ts` — calls `getSampleSpecContent(req.params.name)`; returns 404 `{ error: "Spec not found" }` if null; otherwise returns `{ name: req.params.name, content }` as JSON
- [x] Add `POST /` handler to `sampleSpecs.ts` using `multer({ storage: multer.memoryStorage() }).single("file")` middleware — validates that `req.file` exists and the original filename ends with `.md` (400 otherwise); calls `uploadSampleSpec(req.file.originalname, req.file.buffer, req.file.mimetype || "text/markdown")`; returns 201 `{ name: req.file.originalname }`
- [x] Add `DELETE /:name` handler to `sampleSpecs.ts` — calls `deleteSampleSpec(req.params.name)` and returns 204 No Content; 500 on error
- [ ] Mount `sampleSpecsRouter` at `/sample-specs` in `src/server/routes/index.ts` (import from `./sampleSpecs.js` and add `apiRouter.use("/sample-specs", sampleSpecsRouter)` before the 404 catch-all)
