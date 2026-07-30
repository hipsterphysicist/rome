# Backend — `/server`

## What This Is

The backend half of a full-stack TypeScript template: a minimal Express API
that serves typed JSON to the React SPA in `/app`. This directory is a
**template** — the one example feature (a temperature reading served from disk)
is the reference implementation of the full-stack data pattern every new
feature should copy, not a product in its own right.

The example deliberately mirrors the app's example feature: the app consumes a
temperature reading, and this server is the source that produces it. Together
the two halves illustrate the complete data lifecycle — from a file on disk to
a component on screen (see **Full-Stack Data Flow** below).

For the frontend conventions this connects to, see `../app/CLAUDE.md`. For the
repository overview, see `../CLAUDE.md`.

## Guiding Principles

- **Neat and organized.** Every file has one job and a predictable home.
  Infrastructure (`lib/`) is separated from transport (`routers/`); routers are
  separated from services. Split files before they sprawl.
- **Minimize dependencies.** Prefer node built-ins (`fetch`, `fs/promises`,
  `path`, `URLSearchParams`) and what is already installed. Adding a dependency
  requires a reason the existing stack can't satisfy.
- **Follow the existing pattern.** Each layer below has one canonical example
  in the code — copy its shape for new features rather than inventing a
  parallel approach.

## Stack

| Tool       | Notes                                                            |
| ---------- | --------------------------------------------------------------- |
| Express    | 5 — one router per URL prefix, JSON responses                   |
| TypeScript | 6, `strict` — **CommonJS** (`module: commonjs`), unlike `/app`  |
| ts-node    | Runs `src/` directly in dev via nodemon                         |
| nodemon    | `nodemon.json` watches `src/**/*.ts`                            |
| Vitest     | `.test.ts` files in `src/tests/`; supertest for HTTP-level tests |

Dependencies are intentionally minimal: `express`, `cors`, `dotenv` — nothing
else. No ORM, no database, no framework layers. Use node built-ins
(`fs/promises`, `path`) for IO. Adding a dependency requires a reason these
can't cover.

Scripts: `yarn dev` (nodemon), `yarn docker` (`nodemon -L`, polling for bind
mounts in a container), `yarn build` (tsc → `dist/`), `yarn start`,
`yarn test` (vitest).

## Running the Server

```bash
cd server
yarn          # install once
yarn dev      # ts-node + nodemon on :3000

# ...or both services together, from the repo root:
docker compose up          # local dev (bind mounts)
```

The server binds to `0.0.0.0` so Docker port mapping works, and exposes
`GET /healthcheck` for smoke checks.

Two Dockerfiles live in `Dockerfiles/`, mirroring the app's pair:

- **`Dockerfile.local`** — `node:alpine` + `yarn`, runs `yarn docker`
  (`nodemon -L`, polling for bind mounts). Used by `docker-compose.yaml`.
- **`Dockerfile.prod`** — hardened single-stage: `apk update && apk upgrade`,
  install deps, `yarn build` (`tsc` → `dist/`, including the on-disk data), then
  set `NODE_ENV=production`, drop to the non-root `node` user, and run
  `node dist/index.js`. Used by `docker-compose.prod.yaml`. (Same `node:alpine`
  base as the app.)

## Directory Structure

```
server/src/
  index.ts                 # App setup: middleware, router mounts, listen
  routers/                 # One Express router per URL prefix (weather.ts)
  lib/
    services/              # Data-access classes + singleton exports (disk.ts)
    data/                  # On-disk JSON datasets read by services
  tests/                   # All test files (.test.ts), mirroring app/src/tests
```

All tests live in `src/tests/` — the same layout as the app — and import source
through the `@` → `src` alias (`@/lib/services/disk`, `@/index`), not relative
paths.

## Entry Point

`index.ts` does four things only — create the app, apply middleware, mount
routers, listen. It **exports `app`** and guards the `listen` behind
`require.main === module`, so tests can import the app and drive it in-process
without opening a port:

```ts
// server/src/index.ts
export const app: Express = express();

app.use(cors());
app.use(express.json());
app.use("/weather", weather);

app.get("/healthcheck", (req: Request, res: Response) => {
  res.send("Hello, world!");
});

// Only listen when run directly, not when imported by a test.
if (require.main === module) {
  const host = "0.0.0.0";
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server is running on ${host}:${port}`);
  });
}
```

- Configuration comes from `process.env` with sensible defaults (`PORT`,
  fallback 3000); bind to `0.0.0.0` so Docker port mapping works.
- Keep `/healthcheck` intact.
- No route logic in `index.ts` — only middleware and mounts. Export `app` and
  gate the `listen` so it stays importable for tests.

## Routers

One router file per URL prefix in `src/routers/`, exporting a **named**
`express.Router()` that `index.ts` mounts:

```ts
// server/src/routers/weather.ts
export const weather = express.Router();

weather.get("/current", async (req: Request, res: Response) => {
  try {
    const temperature = await DataStore.temperature();
    res.send(temperature);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
```

- Handlers are thin: call a service method, send the result.
- Every async handler wraps its body in `try/catch` and returns
  `res.status(500).json({ error })` on failure — never let a rejection escape.
- No data access or business logic in routers — that lives in services.

## Services

Data access lives in `src/lib/services/` as a **class plus a singleton
instance export** (the class carries the logic; the singleton carries the
cache):

```ts
// server/src/lib/services/disk.ts
export class DataService {
  private readonly dataPath: string;
  private temperatureCache: Temperature | null = null;

  async read<T = unknown>(filename: string): Promise<T> { ... }

  async temperature(): Promise<Temperature> {
    if (this.temperatureCache) return this.temperatureCache;
    this.temperatureCache = await this.read<Temperature>("temperature.json");
    return this.temperatureCache;
  }
}

export const DataStore = new DataService();
```

- Methods return typed, app-ready shapes — reading, parsing, joining, and
  null-safety happen here, not in routers.
- Cache expensive reads in a private field; return the cache on repeat calls.
- Response-shape interfaces (e.g. `Temperature`) are declared and exported from
  the service file, and must stay in sync with the copy in `app/src/lib/types/`.
- New data domains get a new method on an existing service, or a new
  class + singleton pair in a new file when the underlying source differs.
- The example reads JSON from disk, but a service is just the place external
  data enters the app: a method could equally `fetch` an upstream API or read
  an env-configured source. Keep the class/singleton + cache shape either way.

## Testing — Vitest

Vitest is in `devDependencies`; tests run via `yarn test`. Config lives in
`vitest.config.ts` (`environment: "node"`, `globals: true`, plus the `@` → `src`
alias), so tests read like the app's — plain `describe` / `it` / `expect` with
no imports, and source imported via `@/...`.

**Where tests live:** all in `src/tests/` with the `.test.ts` suffix — the same
layout as `app/src/tests/`, not co-located with source. `tsconfig.json` excludes
`**/*.test.ts` from the `yarn build`, so tests never land in `dist/`.

**What to test** (in priority order):

- **Services first** — the primary target. Drive the class directly (`new
  DataService()`), assert on the returned shape, and verify caching (a second
  call returns the same reference). No HTTP, no app.

  ```ts
  // src/tests/disk.test.ts
  import { DataService } from "@/lib/services/disk";

  const service = new DataService();
  const first = await service.temperature();
  const second = await service.temperature();
  expect(second).toBe(first); // served from cache
  ```

- **Routers next** — an integration test that drives the real app in-process
  with `supertest`, importing the exported `app` from `index.ts` (its `listen`
  is guarded, so the import won't open a port). Assert on status and body shape.

  ```ts
  // src/tests/weather.test.ts
  import request from "supertest";
  import { app } from "@/index";

  const res = await request(app).get("/weather/current");
  expect(res.status).toBe(200);
  expect(res.body.current.temperature_2m).toBe(98.4);
  ```

Each `it` tests exactly one behavior. All tests must pass before moving on.

## Server Conventions

- Import grouping comments apply here (`// Node`, `// Express`, `// Middleware`,
  `// Routers`, `// Services`, `// Types`). One blank line between groups.
- The server is **CommonJS** — do not add `"type": "module"` or ESM-only
  dependencies. `/app` is ESM; the two are intentionally split — don't
  "harmonize" them.
- Same Prettier conventions as `/app`: 80-char width, 2-space indent, double
  quotes, semicolons, trailing commas (ES5), always-parens arrows.
- No `enum`, no `namespace` — use `type`/`interface` and plain objects.
- No database. The server reads its source through cached services — don't
  introduce a persistence layer until the data outgrows this.

---

## Full-Stack Data Flow

The end-to-end pattern, using the example feature as the reference. The server
half lives here; the frontend half follows the conventions in
`../app/CLAUDE.md`.

```
JSON on disk → DataService (read, cache)              [server/src/lib/services]
            → express.Router GET /weather/current      [server/src/routers]
            → Vite dev proxy (/weather → server :3000) [app/vite.config.ts]
            → FetchTemperature() fetch                  [app/src/lib/client]
            → DataProvider dispatches to Redux          [app/src/lib/context]
            → components select via useAppSelector      [app/src/app/components]
```

**The contract is hand-maintained.** There is no shared package, so the
response interface (`Temperature`, exported from `disk.ts`) and the app's copy
(`TemperatureT` in `app/src/lib/types/`) must be kept in sync field-for-field
on both sides.

**Proxy wiring.** For the app to reach this server through a relative path, the
app fetches `/weather/current` and the Vite dev proxy forwards the prefix to
Express (`http://localhost:3000` locally; `http://server:3000` inside the
Compose network). Register each server route prefix in `server.proxy` in
`app/vite.config.ts` — this is the seam that lets the client fetch relative
paths instead of hardcoding the server origin. Wiring it is part of finishing
any feature that calls the server. (The example app currently fetches
Open-Meteo directly; pointing `FetchTemperature` at `/weather/current` is the
step that routes it through this backend.)

## Adding a Feature — Checklist

Backend (this directory):

1. **Data/source** — put source data under `server/src/lib/data/` (or identify
   the upstream the service will `fetch`).
2. **Service** — add a typed method (or a new service class + singleton) under
   `server/src/lib/services/`; export its response interface.
3. **Router** — add a named router in `server/src/routers/` (or extend one);
   mount its prefix in `server/src/index.ts`.
4. **Tests** — add a `*.test.ts` under `server/src/tests/` for the service (and
   a supertest integration test for the router); `yarn test` must pass.

Frontend (see `../app/CLAUDE.md` for the details of each):

5. **Proxy** — register the route prefix in `server.proxy` in
   `app/vite.config.ts`.
6. **Type** — mirror the response interface in `app/src/lib/types/`.
7. **Client** — add a `PascalCase` async fetch function in
   `app/src/lib/client/` that throws on non-OK.
8. **Slice** — add a slice (with any `loading`/`error` fields) under
   `app/src/lib/store/features/`, register it in `store.ts`.
9. **DataProvider** — add a renderless provider in `app/src/lib/context/` that
   fetches, guards, and dispatches; register it in `RootProvider`.
10. **Route + Component** — add the route in `RouterProvider.tsx` and the page
    under `app/src/app/components/`; read from the store with `useAppSelector`,
    guard with early returns.
