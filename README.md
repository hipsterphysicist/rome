# Rome — Full-Stack TypeScript Template

A scaffolding template for full-stack TypeScript apps: a React SPA (`/app`) and
a minimal Express API (`/server`), wired together with Docker Compose. Neither
half is a product — each ships one small example feature that is the reference
implementation of the pattern new features should copy. Read as a pair, they
trace the full data lifecycle from a file on the backend to a component on
screen.

## Layout

```
rome/
  app/                       # React SPA — Vite, React Router, Redux Toolkit, Tailwind
    src/                     #   app/ (UI) + lib/ (infra) + tests/
    Dockerfiles/             #   Dockerfile.local + hardened Dockerfile.prod (nginx)
    CLAUDE.md                #   frontend conventions
  server/                    # Express API — TypeScript, ts-node, JSON over HTTP
    src/                     #   index.ts + routers/ + lib/ + tests/
    Dockerfiles/             #   Dockerfile.local + hardened Dockerfile.prod
    CLAUDE.md                #   backend conventions
  docker-compose.yaml        # Local dev — both services, bind mounts + HMR
  docker-compose.prod.yaml   # Production — both services, built images
  CLAUDE.md                  # Overview + pointers into each half
```

## Running

```bash
# Local dev — app on :5173 (HMR), server on :3000, both source-bind-mounted
docker compose up

# Production — hardened images (app via nginx, server as compiled Node)
docker compose -f docker-compose.prod.yaml up
```

Compose service names are `app` and `server`; inside the Compose network the app
reaches the API at `http://server:3000`. Each service can also be run on its own
— see its directory's `CLAUDE.md`.

## Data Flow

```
JSON on disk → DataService (read, cache)              [server/src/lib/services]
            → express.Router GET /weather/current      [server/src/routers]
            → Vite dev proxy (/weather → server :3000) [app/vite.config.ts]
            → client fetch                              [app/src/lib/client]
            → DataProvider dispatches to Redux          [app/src/lib/context]
            → components select via useAppSelector      [app/src/app/components]
```

## Docs

- **`CLAUDE.md`** — repo overview and where to look.
- **`app/CLAUDE.md`** — frontend conventions.
- **`server/CLAUDE.md`** — backend conventions.
