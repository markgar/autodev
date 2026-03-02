# Review Themes

Last updated: Scaffolding

1. **tsconfig rootDir/include mismatch** — When `tsconfig.server.json` includes files outside `rootDir` (e.g., `src/shared`), set `rootDir` to the common ancestor (`src`), then update all path-dependent scripts (e.g., `start`) to match the new output layout (`dist/server/server/index.js`).
2. **Start script not updated after tsconfig changes** — Any change to `rootDir` or `outDir` in a tsconfig must be followed immediately by updating every `package.json` script that references compiled output paths; the build succeeding is not sufficient verification.
3. **Missing `@types/node` in server projects** — Node.js TypeScript server projects must always include `@types/node` in `devDependencies`; `tsx` transpile-only mode masks the missing types at dev time but `tsc` production builds fail.
4. **Health endpoint not wired to real dependencies** — Every external dependency (Cosmos, Blob, cache, queue) introduced in a milestone must be actively probed by the health endpoint; unconditional `{ status: "ok" }` responses are a [bug], not a placeholder.
5. **No-op try/catch** — A `catch` block that only re-throws is dead code; either remove the try/catch or add meaningful handling (log, transform, clean up) before re-throwing.
6. **Spec-listed devDependencies omitted** — Packages explicitly listed in the milestone spec (e.g., `@vitest/ui`) must be present in `package.json`; omission is a spec deviation and breaks documented developer workflows.
7. **`noEmit` missing from Vite-compiled tsconfigs** — Client-side TypeScript compiled exclusively by Vite should have `"noEmit": true` in its tsconfig to prevent accidental `tsc` invocations from scattering `.js` files into the source tree.
