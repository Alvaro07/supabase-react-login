# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn dev                  # Start dev server (http://localhost:5173)
yarn build                # Typecheck + production bundle
yarn lint                 # ESLint
yarn typecheck            # tsc --noEmit

# Tests
yarn test                 # Watch mode
yarn test:run             # Single pass (CI)
yarn test:coverage        # Coverage report (must stay above thresholds)
yarn test:ui              # Vitest browser UI

# Run a single test file
yarn test:run src/features/auth/model/authStore.test.ts

# Supabase
yarn supabase:types       # Regenerate src/shared/lib/supabase/types.ts from remote schema
```

CI uses **yarn**, not npm. Always use yarn locally to keep `yarn.lock` in sync.

## Architecture

### Feature-Sliced Design (FSD)

Layers have strict one-way dependencies — upper layers import from lower ones, never the reverse:

```
app → pages → widgets → features → entities → shared
```

Each **feature** (`src/features/auth/`) is divided into three segments:

- `api/` — calls to external services. Returns `AuthResult<T>` (never throws).
- `model/` — Zustand store + custom hooks that hold business logic.
- `ui/` — React components, only presentation and local form state.

### Auth flow

`AppProviders` mounts a `SessionProvider` that calls `useSession()`. This hook:

1. Calls `authApi.getSession()` on mount to hydrate the store from localStorage.
2. Subscribes to `supabase.auth.onAuthStateChange` for real-time session updates.
3. Returns a cleanup that unsubscribes — preventing memory leaks.

`ProtectedRoute` reads `isLoading` and `isAuthenticated` from the Zustand store via selectors. While `isLoading` is `true` it renders `null` to prevent a login flash for already-authenticated users.

### Key patterns

**Result type** — `authApi` never throws. Every method returns `AuthResult<T>` (`src/features/auth/api/authApi.ts:18`):

```ts
type AuthResult<T> = { data: T; error: null } | { data: null; error: AuthError }
```

The caller must branch on `result.error` before accessing `result.data`.

**Zustand selectors** — Always use the named selector functions defined at `src/features/auth/model/authStore.ts:62` (`selectIsAuthenticated`, `selectIsLoading`) rather than accessing the full store, to avoid unnecessary re-renders.

**Env validation** — `src/shared/config/env.ts:8` parses `import.meta.env` with a Zod schema at module load time. The app crashes immediately with a clear message if variables are missing. For tests, `test.env` in `vite.config.ts:21` injects the values so Zod doesn't fail before test modules load.

**Supabase error mapping** — Raw Supabase error strings (English, sometimes cryptic) are translated to Spanish via `mapAuthError` at `src/features/auth/api/authApi.ts:90`. New Supabase error messages must be added to the `errorMap` there.

### Path aliases

```
@app      → src/app
@pages    → src/pages
@features → src/features
@widgets  → src/widgets
@shared   → src/shared
```

## Testing conventions

- **MSW** — server setup at `src/shared/lib/test/server.ts`, global lifecycle at `src/shared/lib/test/setup.ts`. Add per-test handlers with `server.use(http.post(...))` — they are reset after each test automatically.
- Tests that need to bypass HTTP (e.g. error branches hard to trigger via HTTP) use `vi.spyOn(supabase.auth, 'method')` — see examples at `src/features/auth/api/authApi.test.ts:102`.
- `renderWithProviders` at `src/shared/lib/test/renderWithProviders.tsx` wraps components in `QueryClientProvider` + `PrimeReactProvider`.
- Coverage thresholds (lines/functions/statements ≥ 70%, branches ≥ 60%) enforced in CI via `vite.config.ts:44`.

## Code style

Prettier config: no semicolons, single quotes, 2-space indent, trailing commas, 100-char line width.

Commits must follow **Conventional Commits** (`feat:`, `fix:`, `test:`, `refactor:`, etc.) — enforced by commitlint + husky on every commit.
