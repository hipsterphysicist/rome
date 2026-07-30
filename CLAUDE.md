# Rome — A Full-Stack TypeScript Template

## What This Is

A scaffolding template for full-stack TypeScript applications: a React SPA in
`/app` and a minimal Express API in `/server`. Neither half is a product — each
ships one small example feature that is the **reference implementation** of the
pattern all future features should copy.

The two examples are two ends of the same wire: the server serves a temperature
reading, and the app consumes it. Read as a pair, they trace the full data
lifecycle from a file on the backend to a component on screen.

## Repository Layout

```
rome/
  app/                       # React SPA — Vite, React Router, Redux Toolkit, Tailwind
    CLAUDE.md                #   → frontend conventions
    src/                     #   app/ (UI) + lib/ (infra) + tests/
    Dockerfiles/             #   Dockerfile.local + hardened Dockerfile.prod (nginx)
  server/                    # Express API — TypeScript, ts-node, JSON over HTTP
    CLAUDE.md                #   → backend conventions
    src/                     #   index.ts + routers/ + lib/ + tests/
    Dockerfiles/             #   Dockerfile.local + hardened Dockerfile.prod
  docker-compose.yaml        # Local dev — both services, bind mounts + HMR
  docker-compose.prod.yaml   # Production — both services, built images
  CLAUDE.md                  # This file — overview + pointers
```

## Running

```bash
# Local dev — app on :5173 (HMR), server on :3000, both source-bind-mounted
docker compose up

# Production — hardened images, app served by nginx, server as compiled Node
docker compose -f docker-compose.prod.yaml up
```

Compose service names are `app` and `server`; inside the Compose network the
app reaches the API at `http://server:3000`. Each service can also be run on
its own — see the respective `CLAUDE.md`.

## Where to Look

- **Working in `/app`** (components, routing, Redux, styling, the client that
  calls the server) → read **`app/CLAUDE.md`**.
- **Working in `/server`** (routers, services, on-disk data, the API contract)
  → read **`server/CLAUDE.md`**.
- **Adding a feature that spans both** → start with the checklist at the end of
  `server/CLAUDE.md`; it walks the backend steps then hands off to the app.

## Shared Principles

Both halves follow the same spirit, even though their toolchains differ (the
app is ESM, the server is CommonJS — intentionally, don't harmonize them):

- **One job per file, a predictable home for it.** Infrastructure (`lib/`) is
  separated from UI/transport.
- **Minimize dependencies.** Prefer the platform (`fetch`, `fs/promises`,
  `URLSearchParams`) and what's installed; adding a dependency needs a reason.
- **Copy the canonical example.** Each layer has exactly one pattern in the
  code — extend it rather than inventing a parallel approach.
- **The client/server contract is hand-maintained.** There is no shared
  package: response shapes are declared on the server and mirrored
  field-for-field in the app's types.

## Full-Stack Data Flow

```
JSON on disk → DataService (read, cache)              [server/src/lib/services]
            → express.Router GET /weather/current      [server/src/routers]
            → Vite dev proxy (/weather → server :3000) [app/vite.config.ts]
            → client fetch                              [app/src/lib/client]
            → DataProvider dispatches to Redux          [app/src/lib/context]
            → components select via useAppSelector      [app/src/app/components]
```

Each stage is documented in the CLAUDE.md of the directory it lives in.
