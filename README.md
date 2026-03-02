# AutoDev

A web portal where users describe software they want, and the platform builds it autonomously.
It is the front-end for [buildteam](https://github.com/markgar/buildteam).

See [REQUIREMENTS.md](./REQUIREMENTS.md) for feature requirements and [SPEC.md](./SPEC.md) for technical decisions.

## Build & Run

```bash
npm install
npm run build   # compiles frontend (Vite) and backend (tsc)
npm start       # serves the app on http://localhost:3000
```

## Develop

```bash
npm run dev     # starts Vite dev server (frontend) + ts-node-dev (backend) concurrently
```

Set `STAMP_ID` in a `.env` file (defaults to `qqq`). Authenticate to Azure via `az login` before running locally.
