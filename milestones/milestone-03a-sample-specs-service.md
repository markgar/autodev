# Milestone: Sample Specs API — Service Layer

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

---

- [ ] Install `multer` runtime package and `@types/multer` dev package (`npm install multer && npm install -D @types/multer`) for multipart file upload parsing in Express
- [ ] Create `src/server/lib/sampleSpecsService.ts` with `listSampleSpecs(): Promise<SampleSpec[]>` — calls `getBlobServiceClient().getContainerClient("sample-specs").listBlobsFlat()` and maps each `BlobItem` to `{ name: blob.name, size: blob.properties.contentLength ?? 0, lastModified: blob.properties.lastModified?.toISOString() ?? "" }`
- [ ] Add `getSampleSpecContent(name: string): Promise<string | null>` to `sampleSpecsService.ts` — gets `BlockBlobClient` for the named blob; returns `null` if the blob does not exist (catch 404 / `BlobNotFound`); otherwise downloads to buffer and returns `buffer.toString("utf-8")`
- [ ] Add `uploadSampleSpec(name: string, buffer: Buffer, contentType: string): Promise<void>` to `sampleSpecsService.ts` — calls `blockBlobClient.upload(buffer, buffer.length, { blobHTTPHeaders: { blobContentType: contentType } })`
- [ ] Add `deleteSampleSpec(name: string): Promise<void>` to `sampleSpecsService.ts` — calls `blockBlobClient.deleteIfExists()`
