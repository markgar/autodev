## Milestone: Infrastructure & Health Fixes

> **Validates:**
> - `GET /api/health` returns HTTP 200 `{ "status": "ok" }` when Azure is reachable; returns 503 when Azure is not reachable (validator should test the 200 path)

> **Reference files:**
> - `src/server/routes/health.ts` — thin router pattern: `Router()`, async handler, `res.json()`
> - `src/server/routes/index.ts` — how to mount a sub-router with `apiRouter.use(...)`
> - `src/server/lib/cosmosClient.ts` — how to get the Cosmos `client` singleton
> - `src/server/lib/blobClient.ts` — how to get the `BlobServiceClient` singleton

- [x] Fix `start` script path bug (finding #5): in `package.json` change `"start": "node dist/server/index.js"` to `"start": "node dist/server/server/index.js"` so `npm start` resolves the compiled entry point correctly after `tsc` outputs to `dist/server/server/index.js`

- [x] Remove no-op try/catch from `createCosmosContainers` in `src/server/lib/cosmosClient.ts` (finding #7): delete the `try { ... } catch (err) { throw err; }` wrapper, leaving the two `await` calls at the top level of the function; the caller in `index.ts` already handles errors with `.catch()`

- [x] Update `GET /api/health` in `src/server/routes/health.ts` to probe dependencies (finding #6): import `client` from `../lib/cosmosClient.js` and `getBlobServiceClient` from `../lib/blobClient.js`; make the handler `async`; call `await client.getDatabaseAccount()` and `await getBlobServiceClient().getAccountInfo()`; return `{ status: "ok" }` on success and `res.status(503).json({ status: "error", error: String(err) })` on failure
