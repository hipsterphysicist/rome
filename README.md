# Rome

Rome is a beautiful React template.

The template is built with a modern TypeScript stack, and containerized for both local development and production.

The codebase implements code standards and best practices I've developed over the course of many years in full-stack development.

1. Code should be legible, and extensible
2. Applications should be fast
3. Create lovely development experiences
4. Build things nobody knew they needed

These attributes serve long term development by maintaining a code quality and architecture that adapts to the chaos intrinsic to fast-pace research teams.

---

## Architecture

### Frontend Stack

| Layer            | Technology             | Version |
| ---------------- | ---------------------- | ------- |
| UI framework     | React                  | 19      |
| Language         | TypeScript             | 6       |
| Build tool       | Vite                   | 8       |
| Routing          | React Router           | 7       |
| State management | Redux Toolkit          | 2       |
| Styling          | Tailwind CSS + DaisyUI | 4 / 5   |
| Testing          | Vitest                 | 4       |

### Source Layout

```
app/src/
  app/          # UI layer — routes, page components, styles
  lib/
    client/     # Plain async fetch functions (no hooks)
    context/    # Provider components (StoreProvider, RouterProvider, DataProvider)
    store/      # Redux store factory, typed hooks, feature slices
    types/      # Shared TypeScript types
```

### Application Entry

`main.tsx` renders a single `<RootProvider />` which composes all providers in a fixed hierarchy. `StoreProvider` (Redux) is the outermost wrapper; `RouterProvider` (React Router) owns the visible UI tree; `DataProvider` is a renderless sibling that fetches external data and dispatches it into the store.

### State Management

Redux Toolkit drives all shared state via feature slices. The store is created with a `makeStore()` factory so types are fully inferred — never written by hand. Components read from the store via typed `useAppSelector` hooks; prop drilling for store data is not used.

### Data Fetching

API calls are plain async functions in `lib/client/` — no hooks, no HTTP libraries. Renderless `DataProvider` components call these functions in `useEffect`, check the Redux store first to guard against redundant fetches, then dispatch results. The app currently integrates with the Open-Meteo API for current temperature data (Austin, TX).

### Styling

Tailwind v4 is loaded as a Vite plugin — there is no `tailwind.config.js`. DaisyUI v5 provides semantic component classes (`btn`, `drawer`, `menu`, etc.) and theme tokens (`bg-base-100`, `text-base-content`). Hardcoded colors are avoided so theming works across DaisyUI themes.

### Build and Deployment

**Development** (`docker-compose.yaml`): `node:alpine` container running the Vite dev server on port 5173 with HMR and a bind-mounted source tree.

**Production** (`docker-compose.prod.yaml`): Multi-stage Docker build — Node compiles the static bundle with `vite build`, which is then copied into an `nginx:stable-alpine` image. nginx serves on port 8080 with gzip compression and a `try_files` SPA fallback for client-side routing.

The Vite build uses manual chunk splitting to separate vendor bundles (`vendor-react`, `vendor-router`, `vendor-state`) for long-term caching.
