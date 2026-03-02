## Milestone: Scaffolding

> **Validates:**
> - `GET /api/health` returns HTTP 200 with body `{ "status": "ok" }`
> - `npm test` runs vitest and all placeholder tests pass
> - `npm run build` compiles both server (tsc) and client (vite) without errors

> **Reference files:**
> - `src/server/index.ts` — Express entry point and startup wiring
> - `src/server/routes/health.ts` — thin route handler pattern
> - `src/server/lib/cosmosClient.ts` — Azure SDK client init pattern
> - `src/shared/types.ts` — shared TypeScript types
> - `vite.config.ts` — Vite build configuration with /api proxy

- [x] Initialize Node.js + TypeScript project: `package.json` with scripts (`dev`, `build`, `build:server`, `build:client`, `start`, `test`), dependencies (express, @types/express, typescript, tsx, vite, react, react-dom, @types/react, @types/react-dom, react-router-dom, lucide-react, sonner), and devDependencies (vitest, @vitest/ui, @testing-library/react); root `tsconfig.json` with `strict: true`, `module: NodeNext`, `moduleResolution: NodeNext`; `tsconfig.server.json` extending root, targeting `src/server`, outputting to `dist/server`; `tsconfig.client.json` extending root for Vite/DOM types

- [ ] Create Express server entry point `src/server/index.ts`: import express, serve `dist/public` as static files with `express.static`, register API router at `/api`, call `createCosmosContainers()` on startup (log error without crashing), listen on `process.env.PORT ?? 3000`, log `Server listening on port …`

- [ ] Add GET `/api/health` route handler in `src/server/routes/health.ts` returning `res.json({ status: "ok" })`; create `src/server/routes/index.ts` that mounts the health router and exports the combined API router; import and use it in `src/server/index.ts`

- [ ] Scaffold Vite + React SPA: `index.html` (root HTML, mounts `#root`), `src/client/main.tsx` (renders `<App />`), `src/client/App.tsx` (placeholder "AutoDev" heading), `vite.config.ts` (React plugin, output `dist/public`, `/api` proxy to `http://localhost:3000`)

- [ ] Configure Tailwind CSS: install `tailwindcss`, `postcss`, `autoprefixer`; create `tailwind.config.js` with content paths `["./index.html", "./src/client/**/*.{ts,tsx}"]`; create `postcss.config.js`; create `src/client/index.css` with `@tailwind base; @tailwind components; @tailwind utilities`; import `index.css` in `main.tsx`

- [ ] Initialize shadcn/ui: install `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`; create `components.json` (style: default, tailwind config path, src/client/components/ui alias); add path alias `@` → `src/client` in `vite.config.ts` and `tsconfig.client.json`; create `src/client/lib/utils.ts` with `cn()` helper using `clsx` + `tailwind-merge`

- [ ] Install Azure SDK packages: `@azure/storage-blob`, `@azure/cosmos`, `@azure/identity` (production dependencies in `package.json`)

- [ ] Create Cosmos DB client module `src/server/lib/cosmosClient.ts`: derive account URL as `https://cosmos-autodev-${STAMP_ID}.documents.azure.com:443/` where `STAMP_ID = process.env.STAMP_ID ?? "qqq"`; initialize `CosmosClient` with `DefaultAzureCredential`; export `createCosmosContainers()` that calls `client.databases.createIfNotExists({ id: "autodev" })` then `database.containers.createIfNotExists({ id: "items", partitionKey: { paths: ["/organizationId"] } })`; wrap in try/catch and re-throw

- [ ] Create Blob Storage client module `src/server/lib/blobClient.ts`: derive account URL as `https://stautodev${STAMP_ID}.blob.core.windows.net`; initialize `BlobServiceClient` with `DefaultAzureCredential`; export `getBlobServiceClient()` returning the singleton client

- [ ] Define shared TypeScript types in `src/shared/types.ts`: `Project` interface (id: string, organizationId: string, type: "project", name: string, specName: string, createdAt: string, latestRunStatus: "pending" | "running" | "succeeded" | "failed" | null, runCount: number); `ApiError` interface ({ error: string }); `SampleSpec` interface (name: string, size: number, lastModified: string)

- [ ] Configure vitest: install `vitest`; add `"test": "vitest run"` script to `package.json`; create `vitest.config.ts` (environment: node, include `src/**/*.test.ts`); write placeholder test `src/server/lib/health.test.ts` that asserts `1 + 1 === 2` (trivially passes to confirm the test runner works)
