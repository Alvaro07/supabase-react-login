# Copilot Instructions

## Package manager

Use **yarn**, never npm. Commands: `yarn dev`, `yarn build`, `yarn lint`, `yarn typecheck`, `yarn test:run`, `yarn test:coverage`.

## Architecture — Feature-Sliced Design (FSD)

Layers have strict one-way dependencies. Never import from a higher layer:

```
app → pages → widgets → features → entities → shared
```

Each feature (`src/features/auth/`) has three segments:

- `api/` — external service calls. Never throws — returns `AuthResult<T>`.
- `model/` — Zustand store + hooks with business logic.
- `ui/` — React components with local form state only.

Path aliases: `@app`, `@pages`, `@features`, `@widgets`, `@shared` (mapped in `vite.config.ts`).

## Mandatory patterns

**Result type** — never use try/catch in `api/` layer. Every method must return:

```ts
type AuthResult<T> = { data: T; error: null } | { data: null; error: AuthError }
```

Defined at `src/features/auth/api/authApi.ts:18`. Caller always branches on `result.error`.

**Zustand selectors** — never destructure the full store. Use the named selectors at `src/features/auth/model/authStore.ts:62`:

```ts
const isAuthenticated = useAuthStore(selectIsAuthenticated) // ✅
const { session } = useAuthStore() // ❌
```

**Supabase error mapping** — all Supabase error strings must be translated to Spanish in the `errorMap` at `src/features/auth/api/authApi.ts:90`. Never surface raw Supabase error messages in the UI.

**Env variables** — always access via `src/shared/config/env.ts`, never via `import.meta.env` directly. The schema validates on startup; add new variables to the Zod schema there.

## Testing

- Network calls are intercepted by MSW — add handlers with `server.use(http.post(...))` in each test. Server is at `src/shared/lib/test/server.ts`.
- Use `vi.spyOn(supabase.auth, 'method')` only for error branches that can't be triggered via HTTP mocks.
- Wrap component tests with `renderWithProviders` from `src/shared/lib/test/renderWithProviders.tsx`.
- Coverage thresholds: lines/functions/statements ≥ 70%, branches ≥ 60%.

## Code style

No semicolons, single quotes, 2-space indent, trailing commas, 100-char line width (Prettier). Commits must follow Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`).
