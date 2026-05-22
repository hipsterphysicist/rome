# React App Architecture Guide

This document describes the conventions and patterns used in `/app/src`. Follow these exactly when adding features.

---

## Project Stack

| Tool | Version | Notes |
|---|---|---|
| React | 19 | StrictMode always on |
| React Router | 7 | `createBrowserRouter`, data router |
| Redux Toolkit | 2 | `configureStore` + `createSlice` |
| Tailwind CSS | 4 | Vite plugin, CSS-first (no config file) |
| DaisyUI | 5 | Semantic component classes |
| TypeScript | 6 | Strict, `verbatimModuleSyntax` |
| Vite | 8 | Path alias `@` → `src/` |

---

## Directory Layout

```
src/
  app/                     # UI — routes, components, styles
    App.tsx                # Layout shell (Outlet + nav)
    components/            # Route-level page components
    assets/
    index.css
    App.css
  lib/                     # Infrastructure — not UI
    client/                # Raw fetch functions (no hooks)
    context/               # Provider components
    store/
      store.ts             # makeStore factory + type exports
      hooks.ts             # Typed useAppDispatch/Selector/Store
      features/            # One file per slice
    types/                 # Shared TypeScript types
```

---

## Provider Composition

`main.tsx` renders exactly one thing: `<RootProvider />`.

```tsx
// main.tsx
createRoot(document.getElementById("root")!).render(<RootProvider />);
```

`RootProvider` composes all providers in a fixed order:

```tsx
// lib/context/RootProvider.tsx
export const RootProvider = () => (
  <StrictMode>
    <StoreProvider>
      <RouterProvider />
      <DataProvider />
    </StoreProvider>
  </StrictMode>
);
```

**Rules:**
- `StoreProvider` is always the outermost application wrapper so every provider and component can access the store.
- `RouterProvider` and `DataProvider` are **siblings**, not nested. `RouterProvider` owns the entire visible UI tree. `DataProvider` is renderless (no children, no visible output).
- Add new providers as siblings inside `StoreProvider`, never as wrappers around `RouterProvider`.

---

## RouterProvider

The router config lives at **module scope** inside `RouterProvider.tsx`, not inside the component.

```tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,       // layout shell
    children: [
      { path: "/",        element: <LandingPage /> },
      { path: "/about",   element: <About /> },
    ],
  },
]);

export const RouterProvider = () => <ReactRouter router={router} />;
```

- `App` is the layout shell. It renders `<Outlet />` where child routes appear.
- Use `NavLink` (not `Link`) for navigation so active state is available.
- Add new routes as children of the root `App` entry.

---

## DataProvider — Renderless Side-Effect Provider

A `DataProvider` fetches external data and syncs it into Redux. It renders no UI.

```tsx
// lib/context/DataProvider.tsx
const TemperatureContext = createContext<number | undefined>(undefined);

export const DataProvider = () => {
  const temperature = useAppSelector((state) => state.data.temperature);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetch = async () => {
      const data = await FetchTemperature();
      dispatch(dataActions.temperature(data.current.temperature_2m));
    };

    if (!temperature) fetch();          // guard: skip if already loaded
  }, [temperature, dispatch]);

  return <TemperatureContext.Provider value={temperature} />;  // no children
};
```

**Pattern rules:**
- The provider reads from and writes to Redux — it does not manage local state for shared data.
- The `useEffect` guard (`if (!data) fetch()`) prevents redundant fetches on re-renders.
- Returning `<Context.Provider value={...} />` with no children makes the context available without wrapping the UI tree.
- One `DataProvider` per data domain; add new ones as siblings in `RootProvider`.

---

## Redux Store

### Store factory

The store is created via `makeStore()`, not as a singleton. Types are inferred from the factory, never written by hand.

```ts
// lib/store/store.ts
export const makeStore = () =>
  configureStore({ reducer: { data } });

export type AppStore   = ReturnType<typeof makeStore>;
export type RootState  = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
```

`StoreProvider` instantiates it once with `useMemo`:

```tsx
const store: AppStore = useMemo(() => makeStore(), []);
```

### Typed hooks

Always use the typed wrappers — never import `useDispatch`/`useSelector` directly.

```ts
// lib/store/hooks.ts
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => AppStore = useStore;
```

### Slice conventions

```ts
// lib/store/features/data.ts
type DataState = {
  string: string | undefined;
  temperature: number | undefined;
};

const initialState: DataState = { ... };

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    temperature: (state, action: PayloadAction<number>) =>
      ({ ...state, temperature: action.payload }),   // spread, don't mutate
  },
});

export const dataActions = dataSlice.actions;   // named export
export default dataSlice.reducer;               // default export
```

- State shape is an explicit named type (`DataState`), not inferred.
- Reducers use spread returns (`return { ...state, field }`) rather than Immer mutations.
- Actions are namespaced under `dataActions` and exported as a named export.
- The reducer is the default export; add it to `store.ts`'s `reducer` map.

---

## API Client

Client functions live in `lib/client/`. They are plain async functions, not hooks.

```ts
// lib/client/api.ts
export const FetchTemperature = async (): Promise<TemperatureT> => {
  const params = new URLSearchParams({ ... });
  const data: TemperatureT = await fetch(`https://...?${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((r) => r.json());
  return data;
};
```

- Use `URLSearchParams` for query strings.
- Use `fetch` directly (no axios).
- Return the typed response; the caller (a `DataProvider`) handles dispatch.
- Function names are `PascalCase`.

---

## Types

Types live in `lib/types/`. External API response shapes are typed explicitly with a `T` suffix.

```ts
// lib/types/data.ts
export type TemperatureT = {
  current: { time: Date; interval: number; temperature_2m: number };
  // ...
};
```

---

## Component Conventions

### Control flow

Use early-return guards before the main render. Never use ternaries for loading/empty states at the top level.

```tsx
export const About = () => {
  const string = useAppSelector((state) => state.data.string);

  if (!string) return;      // guard — returns undefined (renders nothing)

  return <>About</>;
};
```

### Consuming the store

Components read from Redux directly via `useAppSelector`. Don't thread props down for data that lives in the store.

```tsx
const value = useAppSelector((state) => state.data.fieldName);
```

### Layout shell (App.tsx)

`App.tsx` is only for layout chrome (nav, sidebar, wrappers). It renders `<Outlet />` for child routes. Keep it under 150 lines.

---

## Import Ordering

Group imports with a single-line comment label. Order:

```tsx
// React
// Router
// Hooks
// Store
// Client
// Types
// Styles
// Providers
// Components
```

Use only the groups that apply. No blank lines between items within a group; one blank line between groups.

Cross-module imports use the `@/` alias. Same-folder imports use relative paths.

---

## Styling — DaisyUI + Tailwind v4

- Tailwind is loaded as a Vite plugin; there is no `tailwind.config.js`.
- Use DaisyUI semantic classes for color (`bg-base-100`, `bg-base-200`, `text-base-content`) and components (`btn`, `drawer`, `menu`, `card`, etc.).
- Layout uses Tailwind utility classes (`flex`, `h-screen`, `w-full`, `p-4`).
- Avoid hardcoded colors — prefer DaisyUI tokens so theming works.

---

## ESLint & Formatting

**ESLint rules to respect:**
- `max-lines: 150` (blank lines and comments excluded) — split files before hitting this.
- `react-hooks/recommended` — exhaustive deps, rules of hooks.
- `react-refresh/only-export-components` — don't mix component and non-component exports in the same file unless using `allowConstantExport`.

**TypeScript compiler enforcement:**
- `noUnusedLocals` and `noUnusedParameters` — no dead variables.
- `erasableSyntaxOnly` — no `enum`, no `namespace`.

**Prettier (enforced, not optional):**
- 80-char print width, 2-space indent, double quotes, semicolons, trailing commas (ES5), always-parens for arrow functions.

---

## Adding a New Feature — Checklist

1. **Type** — add the response/domain type to `lib/types/`.
2. **Client** — add a fetch function to `lib/client/api.ts`.
3. **Slice** — add a new slice under `lib/store/features/`, register it in `store.ts`.
4. **DataProvider** — add a new `*Provider` in `lib/context/` (or extend an existing one) to fetch and dispatch; register it as a sibling in `RootProvider`.
5. **Route** — add the route entry to `RouterProvider.tsx` and a component under `app/components/`.
6. **Component** — read from the store with `useAppSelector`; guard with early returns before rendering.
