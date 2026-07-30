# Rome — Full-Stack TypeScript Template

Rome is a beautiful TypeScript template. This codebase incorporates best practices and design patterns I picked up over many years developing research applications.

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

#### Local Development Containers

```bash
docker compose build

docker compose -f docker-compose.prod.yaml up
```

Compose service names are `app` and `server`; inside the Compose network the app
reaches the API at `http://server:3000`. Each service can also be run on its own
— see its directory's `CLAUDE.md`.

#### Hardened Production Containers

```bash
docker compose -f docker-compose.prod.yaml build

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
