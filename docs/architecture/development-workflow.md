# Development Workflow

## Purpose

This document defines how changes move from a feature branch to production
for `saleem-platform`.

GitHub Actions is the mandatory quality gate.
Vercel is the deployment system for static frontend applications (Portfolio, Blog).
A Railway deployment for the Developer Platform API is planned (ADR-0004); it is not configured yet.
Quality gate and deploy remain separate.

## Branch strategy

```text
main
  │
  ├── feature/*
  ├── fix/*
  └── chore/*
```

Examples:

- `feature/blog-vercel`
- `feature/projects`
- `docs/developer-platform-api`
- `fix/blog-seo`
- `chore/ci`

Rules:

- `main` is the protected integration branch.
- Do not develop directly on `main`.
- All product and infrastructure changes land through pull requests.

## Pull request flow

```text
feature branch
      ↓
local validation
      ↓
push branch
      ↓
Pull Request → main
      ↓
GitHub Actions (CI quality gate)
      ↓
review (when collaborators/reviewers are practical)
      ↓
merge to main
      ↓
frontend: Vercel production
API (future): Railway, after the API is hosted
```

## Local validation

Preferred local commands (full workspace):

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

App-specific commands:

```bash
pnpm start                 # portfolio
pnpm start:blog            # blog
pnpm start:api             # API at http://localhost:3000
pnpm db:migrate            # apply API migrations (PostgreSQL required)
pnpm build:portfolio
pnpm build:blog
pnpm build:api
pnpm exec nx lint portfolio
pnpm exec nx lint blog
pnpm exec nx lint api
pnpm exec nx test portfolio
pnpm exec nx test blog
pnpm exec nx test api
```

Affected-only helpers (match CI more closely):

```bash
pnpm affected:lint
pnpm affected:typecheck
pnpm affected:test
pnpm affected:build
```

## Required CI checks

Every pull request targeting `main` must pass:

1. **format** — `pnpm format:check` (Prettier; no auto-write in CI)
2. **lint** — `nx affected -t lint`
3. **typecheck** — `nx affected -t typecheck`
4. **test** — `nx affected -t test`
5. **build** — `nx affected -t build --configuration=production`

Workflow file: `.github/workflows/ci.yml`

Triggers:

- `pull_request` → `main` (primary quality gate)
- `push` → `main` (validates merged state)

CI uses least-privilege GitHub token permissions (`contents: read`).
No Vercel tokens or deployment secrets belong in this workflow.

## Nx affected behavior

CI derives the affected project graph from the PR base/head SHAs
(`nrwl/nx-set-shas`).

Shared workspace inputs (workflow files, `package.json`, lockfile, Nx/TS/ESLint
roots) are listed in `nx.json` `sharedGlobals` so infrastructure changes
invalidate the affected set appropriately.

Blog production builds still run `prepare-content` through the existing
`blog:build` → `prepare-content` dependency. CI does not bypass that pipeline.

`apps/api` exposes the same target names used by CI (`lint`, `typecheck`,
`test`, `build`) so the existing affected workflow includes it automatically.
Do not create a separate API CI system.

API database integration tests need PostgreSQL. The existing quality-gate job
provides a PostgreSQL 16 service container and runs `pnpm db:migrate` against
`saleem_platform_test` before tests. Locally, start Compose Postgres
(`docker compose up -d postgres`; database `saleem_platform`) and run API tests
against the isolated `saleem_platform_test` database on the same server. Unit
tests still run without a database. Do not skip database tests in CI.

## Test infrastructure

Current unit tests use Node.js built-in `node:test`:

- Blog content validation (`apps/blog/scripts/lib/`)
- Blog article query helpers and date formatting
- Portfolio JSON-LD builder
- API configuration, health/ready, and database integration (`apps/api`)

This keeps the quality gate useful without introducing a full Angular component
test harness yet. When component-level tests become necessary, prefer Angular's
first-party Vitest runner (`@angular/build:unit-test`) for Angular 22 / Nx 23.

## Branch protection (manual GitHub settings)

These settings are **not applied by this repository change**. Configure them in
GitHub UI for `saleemkhandev/saleemkhan`:

1. Open **Settings → Rules → Rulesets** (or **Branches → Branch protection rules**)
2. Create a ruleset / protection rule for `main`
3. Enable:
   - Require a pull request before merging
   - Require status checks to pass
     - Required check: `Quality Gate` (job from `.github/workflows/ci.yml`)
   - Require branches to be up to date before merging (recommended)
   - Block force pushes
   - Block deletions
4. For a personal repository, requiring approvals is optional.
   Prefer conversation resolution if review comments are used.
5. Do not allow bypassing required checks for routine work

Most important outcomes:

- PR required
- CI required
- no direct `main` pushes

## Deployment relationship

```text
GitHub
  │
  ├── Pull Request
  │      ↓
  │   GitHub Actions CI checks
  │      ↓
  │   Vercel Preview (frontend app projects)
  │
  └── main
         ↓
     Vercel Production (Portfolio, Blog)
         ↓
     Railway (planned, API hosting)
```

Responsibilities:

- **GitHub Actions** = quality gate (format/lint/typecheck/test/build)
- **Vercel** = preview + production for static frontends
- **Railway** = planned production for the API + managed PostgreSQL (not configured yet)

CI must not duplicate Vercel or Railway deploys.

Root `vercel.json` rewrites `/blog` and `/blog/:path*` to the Blog Vercel project.
Portfolio remains the default project for `saleemkhan.dev`.

## Script semantics

Root scripts validate the **workspace**, not only Portfolio:

| Script                                                        | Meaning                                        |
| ------------------------------------------------------------- | ---------------------------------------------- |
| `pnpm lint`                                                   | lint all projects                              |
| `pnpm typecheck`                                              | typecheck all projects with a typecheck target |
| `pnpm test`                                                   | test all projects with a test target           |
| `pnpm build`                                                  | production-build all projects                  |
| `pnpm build:portfolio` / `pnpm build:blog` / `pnpm build:api` | explicit single-app builds                     |
| `pnpm affected:*`                                             | affected-only variants used by CI              |

## Out of scope (for now)

- Husky / lint-staged / local git hooks
- Nx Cloud / remote caching
- MCP server
- Production API hostname (`api.saleemkhan.dev`)
- Railway hosting for `apps/api`
