# Project: Rome

## What This Is

A React SPA at an early scaffolding stage. The `package.json` name is `atomic`. The app fetches current temperature from the Open-Meteo API for Austin, TX and stores it in Redux — this is the live data integration pattern all future features should follow.

## Stack

| Tool | Version | Notes |
|---|---|---|
| React | 19 | StrictMode always on |
| TypeScript | 6 | `strict`, `verbatimModuleSyntax`, `erasableSyntaxOnly` — no `enum`, no `namespace` |
| Vite | 8 | Path alias `@` → `src/`, manual vendor chunks |
| React Router | 7 | `createBrowserRouter`, data router |
| Redux Toolkit | 2 | `configureStore` + `createSlice` |
| Tailwind CSS | 4 | Vite plugin — no `tailwind.config.js` |
| DaisyUI | 5 | Semantic component classes + theme tokens |
| Vitest | 4 | Co-located `.test.ts(x)` files |

## Directory Structure

```
rome/
  app/                       # Entire frontend
    src/
      app/                   # UI layer
        App.tsx              # Layout shell: drawer nav + <Outlet />
        components/          # Route-level pages (LandingPage, About)
        assets/
        index.css / App.css
      lib/                   # Infrastructure — not UI
        client/api.ts        # Plain async fetch functions (PascalCase names)
        context/
          RootProvider.tsx   # Composes all providers — edit here to add one
          RouterProvider.tsx # Router config at module scope, not inside component
          StoreProvider.tsx  # Instantiates store once via useMemo
          DataProvider.tsx   # Renderless: fetches data → dispatches to Redux
        store/
          store.ts           # makeStore() factory + inferred AppStore/RootState/AppDispatch
          hooks.ts           # useAppDispatch, useAppSelector, useAppStore (always use these)
          features/data.ts   # Redux slice: DataState, dataActions, default reducer export
        types/data.ts        # API response types (T suffix convention)
    Dockerfiles/
      Dockerfile.local       # Dev: node:alpine, Vite dev server
      Dockerfile.prod        # Prod: multi-stage — Node build → nginx:stable-alpine
    nginx.conf               # SPA try_files fallback + gzip
    vite.config.ts           # Alias, plugins, manual chunks, server host/HMR config
  docker-compose.yaml        # Local dev — port 5173, bind mount, HMR
  docker-compose.prod.yaml   # Production — port 5173→8080, static nginx
  docs/CLAUDE.md             # Authoritative style guide — read before adding features
```

## Critical Patterns

**Provider composition order is fixed.**
`StrictMode → StoreProvider → [RouterProvider, DataProvider (siblings)]`.
Add new providers as siblings inside `StoreProvider`, never wrapping `RouterProvider`.

**DataProviders are renderless side-effect providers.**
They read from and write to Redux. No local state for shared data. Guard `useEffect` with `if (!data) fetch()` to prevent redundant requests. Return `<Context.Provider value={...} />` with no children.

**Store types are always inferred.**
`RootState`, `AppDispatch`, and `AppStore` come from the `makeStore()` return type. Never hand-write them. Always use `useAppSelector`/`useAppDispatch` — never raw `useSelector`/`useDispatch`.

**Reducers use spread returns, not Immer mutations.**
`return { ...state, field: action.payload }` — do not mutate `state` in place.

**API clients are plain async functions.**
`lib/client/` contains only `async function → Promise<T>` — no hooks, no axios. `URLSearchParams` for query strings. PascalCase names. The DataProvider calls them; clients never dispatch.

**Components use early-return guards.**
Check for undefined/empty state before the main render path. Never ternaries at the top level for loading states.

## Running the App

```bash
# Local dev (Vite HMR, source bind-mounted)
docker-compose up

# Production build (nginx static serve)
docker-compose -f docker-compose.prod.yaml up
```

## External API

Open-Meteo (`https://api.open-meteo.com/v1/forecast`) — no auth. Returns current weather. The app requests temperature at lat `30.26715`, lon `-97.74306` (Austin, TX) in Fahrenheit.

## Adding a Feature — Checklist

1. **Type** → `lib/types/`
2. **Client** → `lib/client/api.ts`
3. **Slice** → `lib/store/features/`, register in `store.ts`
4. **DataProvider** → new sibling in `lib/context/`, register in `RootProvider`
5. **Route** → add to `RouterProvider.tsx`, add component under `app/components/`
6. **Component** → `useAppSelector` for store reads; early-return guards

## Detailed Conventions

`docs/CLAUDE.md` is the authoritative reference for import ordering, Tailwind/DaisyUI styling rules, Vitest test conventions, ESLint/TypeScript enforcement, and the full pattern examples. Read it before adding any new feature.
