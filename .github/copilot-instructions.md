# Copilot Instructions

## About this codebase

This software is written with assistance from GitHub Copilot. The code is structured to be readable, modifiable, and extendable by Copilot (and other LLM-based agents). Every design decision should reinforce that.

### Guidelines for LLM-friendly code

- **Flat, explicit control flow.** Prefer straightforward if/else and early returns over deeply nested logic, complex inheritance hierarchies, or metaprogramming. Every function should be understandable from its source alone.
- **Small, single-purpose functions.** Keep functions short (ideally under ~40 lines). Each function does one thing with a clear name that describes it. This gives the LLM better context boundaries.
- **Descriptive naming over comments.** Variable and function names should make intent obvious. Use comments only when *why* isn't clear from the code — never to explain *what*.
- **Colocate related logic.** Keep constants, helpers, and the code that uses them close together (or in the same small file). Avoid scattering related pieces across many modules — LLMs work best when relevant context is nearby.
- **Consistent patterns.** When multiple functions do similar things, structure them identically. Consistent shape lets the LLM reliably extend the pattern.
- **No magic.** Avoid decorators that hide behavior, dynamic attribute access, implicit registration, or monkey-patching. Everything should be traceable by reading the code top-to-bottom.
- **Graceful error handling.** Wrap I/O and external calls in try/except (or the language's equivalent). Never let a transient failure crash the main workflow. Log the error and continue.
- **Minimal dependencies.** Only add a dependency when it provides substantial value. Fewer deps mean less surface area for the LLM to misunderstand.
- **One concept per file.** Each module owns a single concern. Don't mix unrelated responsibilities in the same file.
- **Design for testability.** Separate pure decision logic from I/O and subprocess calls so core functions can be tested without mocking. Pass dependencies as arguments rather than hard-coding them inside functions when practical. Keep side-effect-free helpers (parsing, validation, data transforms) in their own functions so they can be unit tested directly.

### Documentation maintenance

- When completing a task that changes the project structure, key files, architecture, or conventions, update `.github/copilot-instructions.md` to reflect the change.
- Keep the project-specific sections (Project structure, Key files, Architecture, Conventions) accurate and current.
- Never modify the coding guidelines or testing conventions sections above.
- This file is a **style guide**, not a spec. Describe file **roles** (e.g. 'server entry point'), not implementation details (e.g. 'uses List<T> with auto-incrementing IDs'). Conventions describe coding **patterns** (e.g. 'consistent JSON error envelope'), not implementation choices (e.g. 'store data in a static variable'). SPEC.md covers what to build — this file covers how to write code that fits the project.

## Project structure

Source code lives in `src/` — this is the primary directory to edit.

```
src/
  server/       # Express app, API route handlers, Azure SDK clients
  client/       # React SPA (Vite root)
    pages/      # One file per route/page
    components/ # Shared UI components
    lib/        # API client helpers and utilities
  shared/       # TypeScript types shared between server and client
dist/
  server/       # Compiled backend (tsc output)
  public/       # Vite frontend output (served as static files by Express)
```

The `client/` subtree never imports from `server/`. Cross-boundary types belong in `src/shared/`.

## Key files

- `SPEC.md` — authoritative technical spec: stack, architecture, API surface, data model
- `REQUIREMENTS.md` — original product requirements and functional spec
- `BACKLOG.md` — work items and task tracking
- `README.md` — project overview and setup instructions
- `.github/copilot-instructions.md` — this style guide (update as the project evolves)
- `src/server/index.ts` — Express server entry point; serves static SPA and mounts `/api` router
- `src/server/routes/index.ts` — API router; mounts all route handlers
- `src/server/routes/health.ts` — GET `/api/health` handler
- `src/server/lib/cosmosClient.ts` — Cosmos DB client singleton and container initialisation
- `src/server/lib/blobClient.ts` — Blob Storage client singleton
- `src/shared/types.ts` — TypeScript types shared between server and client
- `src/client/main.tsx` — React SPA entry point
- `src/client/App.tsx` — Root app component
- `src/client/lib/utils.ts` — `cn()` Tailwind class merge helper
- `vite.config.ts` — Vite build configuration (React plugin, `/api` proxy, `@` path alias)
- `tsconfig.server.json` — TypeScript config for server (tsc, NodeNext)
- `tsconfig.client.json` — TypeScript config for client (Vite/Bundler, DOM)

## Architecture

The application is a single Express server that serves both the compiled React SPA (as static files from `dist/public`) and all API routes under `/api`. The backend is organised into route handlers that delegate to thin service/client wrappers around the Azure SDKs (`@azure/cosmos` and `@azure/storage-blob`); handlers stay thin and side-effect-free logic is extracted into helpers. The React frontend communicates exclusively through the `/api` endpoints and never calls Azure SDKs directly. Shared TypeScript types flow one way — defined in `src/shared/` and imported by both `src/server/` and `src/client/`, so the boundary is always explicit and traceable.

## Testing conventions

- **Use the project's test framework.** Plain functions with descriptive names.
- **Test the contract, not the implementation.** A test should describe expected behavior in terms a user would understand — not mirror the code's internal branching. If the test would break when you refactor internals without changing behavior, it's too tightly coupled.
- **Name tests as behavioral expectations.** `test_expired_token_triggers_refresh` not `test_check_token_returns_false`. The test name should read like a requirement.
- **Use realistic inputs.** Feed real-looking data, not minimal one-line synthetic strings. Edge cases should be things that could actually happen — corrupted inputs, empty files, missing fields.
- **Prefer regression tests.** When a bug is found, write the test that would have caught it before fixing it. This is the highest-value test you can write.
- **Don't test I/O wrappers.** Functions that just read a file and call a pure helper don't need their own tests — test the pure helper directly.
- **No mocking unless unavoidable.** Extract pure functions for testability so you don't need mocks. If you find yourself mocking, consider whether you should be testing a different function.

## Conventions

- **Consistent JSON error envelope.** All API error responses use `{ error: string }` with an appropriate HTTP status code. Never return a bare string or an inconsistent shape.
- **Thin route handlers.** Express handlers validate input, call a service or Azure client helper, and return a response. Business logic and Azure SDK calls live in separate functions — not inline in the handler body.
- **Zod for all input validation.** Parse and validate request bodies and params with Zod schemas before any logic runs. Reject invalid input with a 400 and the Zod error message.
- **Early returns over nesting.** Validate and guard at the top of a function; the happy path runs at the bottom with minimal indentation.
- **Tailwind utility classes only.** All styling uses Tailwind utility classes. No custom CSS, no inline `style` props, no CSS modules. Use the `md:` breakpoint for responsive variants.
- **shadcn/ui components first.** Prefer shadcn/ui primitives (Button, Dialog, Select, etc.) over hand-rolled components. Keep custom components thin wrappers or compositions of shadcn/ui parts.
- **Sonner for all user-facing feedback.** Surface errors and success confirmations via Sonner toasts. Never silently swallow errors on the frontend.
- **React Hook Form + Zod for forms.** All forms use React Hook Form with a Zod resolver. Inline error messages are displayed below each field using shadcn/ui form error styling.
- **Environment-derived resource names.** Azure resource names are always derived from the `STAMP_ID` env var at runtime — never hardcoded beyond the default fallback.
