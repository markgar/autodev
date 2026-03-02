## Milestone: Projects API

> **Validates:**
> - `GET /api/health` returns HTTP 200 `{ "status": "ok" }` when Azure is reachable; returns 503 when Azure is not reachable (validator should test the 200 path)
> - `POST /api/projects` with body `{ "name": "Test App", "specName": "minimal.md" }` returns HTTP 201 with a JSON body containing `id`, `name`, `specName`, `createdAt`, `organizationId`, `type`, `latestRunStatus: null`, `runCount: 0`
> - `GET /api/projects` returns HTTP 200 with a JSON array (may be empty `[]`)
> - `GET /api/projects/:id` with the id from the POST response returns HTTP 200 with the project JSON
> - `GET /api/projects/:id` with an unknown id returns HTTP 404 with `{ "error": "..." }`
> - `GET /api/projects/:id/logs` returns HTTP 200 with `{ "lines": [] }` for a newly created project with no logs yet
> - `POST /api/projects` with a missing `name` field returns HTTP 400 with `{ "error": "..." }`

> **Reference files:**
> - `src/server/routes/health.ts` — thin router pattern: `Router()`, async handler, `res.json()`
> - `src/server/routes/index.ts` — how to mount a sub-router with `apiRouter.use(...)`
> - `src/server/lib/cosmosClient.ts` — how to get the Cosmos `client` singleton
> - `src/server/lib/blobClient.ts` — how to get the `BlobServiceClient` singleton
> - `src/shared/types.ts` — `Project` interface (all fields required by the API response)

- [ ] Fix `start` script path bug (finding #5): in `package.json` change `"start": "node dist/server/index.js"` to `"start": "node dist/server/server/index.js"` so `npm start` resolves the compiled entry point correctly after `tsc` outputs to `dist/server/server/index.js`

- [ ] Remove no-op try/catch from `createCosmosContainers` in `src/server/lib/cosmosClient.ts` (finding #7): delete the `try { ... } catch (err) { throw err; }` wrapper, leaving the two `await` calls at the top level of the function; the caller in `index.ts` already handles errors with `.catch()`

- [ ] Update `GET /api/health` in `src/server/routes/health.ts` to probe dependencies (finding #6): import `client` from `../lib/cosmosClient.js` and `getBlobServiceClient` from `../lib/blobClient.js`; make the handler `async`; call `await client.getDatabaseAccount()` and `await getBlobServiceClient().getAccountInfo()`; return `{ status: "ok" }` on success and `res.status(503).json({ status: "error", error: String(err) })` on failure

- [ ] Create `src/server/lib/projectsService.ts` with three exported functions: `createProject(name: string, specName: string): Promise<Project>` — builds a document with `id: crypto.randomUUID()`, `organizationId: "default"`, `type: "project"`, `name`, `specName`, `createdAt: new Date().toISOString()`, `latestRunStatus: null`, `runCount: 0`; writes it via `client.database("autodev").container("items").items.create(doc)`; returns the created doc cast as `Project`

- [ ] Add `listProjects` and `getProject` to `src/server/lib/projectsService.ts`: `listProjects(): Promise<Project[]>` — queries `SELECT * FROM c WHERE c.organizationId = "default" AND c.type = "project" ORDER BY c.createdAt DESC` via `container.items.query(...).fetchAll()`; `getProject(id: string): Promise<Project | null>` — point-reads via `container.item(id, "default").read<Project>()`; returns `resource ?? null`

- [ ] Create `src/server/lib/logsService.ts` with `getProjectLogs(projectId: string): Promise<string[]>`: use `getBlobServiceClient().getContainerClient(projectId)`; if the container does not exist (catch `BlobServiceClient` 404 or use `exists()`), return `[]`; otherwise list all blobs with `containerClient.listBlobsFlat()`, download each blob's content with `blockBlobClient.downloadToBuffer()`, decode as UTF-8, split by `\n`, filter empty lines, and return all lines as a flat array

- [ ] Create `src/server/routes/projects.ts` with POST `/` and GET `/` handlers: import `z` from `zod`; define `CreateProjectSchema = z.object({ name: z.string().min(1), specName: z.string().min(1) })`; POST handler — parse body with `CreateProjectSchema.safeParse`, return 400 + `{ error: result.error.message }` on failure; call `createProject(name, specName)`, then `getBlobServiceClient().getContainerClient(project.id).createIfNotExists()`, return 201 + project JSON; GET handler — call `listProjects()`, return 200 + array; wrap both handlers in try/catch returning 500 + `{ error: String(err) }` on failure; export `projectsRouter`

- [ ] Add GET `/:id` and GET `/:id/logs` handlers to `src/server/routes/projects.ts`: GET `/:id` — call `getProject(req.params.id)`, return 404 + `{ error: "Project not found" }` if null, otherwise return 200 + project JSON; GET `/:id/logs` — call `getProjectLogs(req.params.id)`, return 200 + `{ lines }`; wrap both in try/catch returning 500 + `{ error: String(err) }` on failure

- [ ] Mount `projectsRouter` in `src/server/routes/index.ts`: import `projectsRouter` from `./projects.js`; add `apiRouter.use("/projects", projectsRouter)` after the health router mount
