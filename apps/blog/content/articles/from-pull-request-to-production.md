---
title: 'From Pull Request to Production'
description: 'The PR-driven workflow behind this platform: GitHub Actions as the quality gate, Nx affected checks, Vercel previews, and production deploys that stay out of CI.'
publishedAt: '2026-08-13'
status: 'published'
tags:
  - ci
  - nx
  - vercel
  - architecture
---

# From Pull Request to Production

A personal site can survive a while on this loop:

```text
Make change
    ↓
Push directly to main
    ↓
Hope nothing broke
    ↓
Deploy
```

That stops being acceptable the moment the repository holds more than one deployable application. This platform is still a personal engineering site — Portfolio at `/`, Blog at `/blog` — but every meaningful change is supposed to be validated before it reaches `main`.

The principle is small:

> Every change should be validated before it reaches main.

GitHub Actions is the quality gate. Vercel is the deployment system. They are intentionally separate. This is not an enterprise delivery platform. It is a PR-driven workflow with a real check, a real preview, and a short list of things it still does not do.

## The workflow at a glance

```text
Developer
    |
    | create feature branch
    v
Feature Branch
    |
    | Pull Request → main
    v
GitHub
    |
    +----------------------+
    |                      |
    v                      v
GitHub Actions          Vercel Preview
    |                      |
    v                      v
Quality Gate            Preview URL
    |
    +-- Format
    +-- Lint (affected)
    +-- Typecheck (affected)
    +-- Tests (affected)
    +-- Production build (affected)
    |
    v
Code review
    |
    v
Protected main
    |
    v
Vercel production
```

Two systems start from the same Pull Request. Actions never deploys. Vercel never runs the quality gate.

## What happens when I open a Pull Request

Work lands on a branch, not on `main`:

```text
main
  │
  ├── feature/*
  ├── fix/*
  └── chore/*
```

A Pull Request targeting `main` is the integration event. Two things start from that PR:

1. **GitHub Actions** runs the `CI` workflow. The job is named `Quality Gate`.
2. **Vercel** builds preview deployments for the GitHub-connected projects. That is Vercel’s GitHub integration, not a step in `.github/workflows/ci.yml`.

The workflow file is the whole CI surface: `.github/workflows/ci.yml`. There is no second workflow for deploy, preview comments, or release.

CI triggers:

- `pull_request` → `main` — the primary quality gate
- `push` → `main` — validates the merged state

Concurrency cancels an in-progress run for the same PR or ref, so a force-push does not leave stale checks racing the latest commit.

The token is least-privilege: `contents: read`. There are no Vercel tokens, deploy keys, or environment secrets in this workflow. That is deliberate. CI is not allowed to ship the site.

## What the Quality Gate actually runs

After checkout (`fetch-depth: 0`, so Nx can see history) the job installs with a frozen lockfile, derives Nx SHAs, then runs five checks in order:

```text
pnpm install --frozen-lockfile
pnpm format:check
nx affected -t lint
nx affected -t typecheck
nx affected -t test
nx affected -t build --configuration=production
```

Node comes from `.nvmrc` (22). pnpm comes from the repo `packageManager` field. `pnpm install --frozen-lockfile` means a lockfile drift fails CI instead of silently rewriting it.

| Check        | Command                                              | Scope                         |
| ------------ | ---------------------------------------------------- | ----------------------------- |
| Format       | `pnpm format:check`                                  | Whole workspace (Prettier)    |
| Lint         | `nx affected -t lint`                                | Affected projects             |
| Typecheck    | `nx affected -t typecheck`                           | Affected projects             |
| Test         | `nx affected -t test`                                | Affected projects             |
| Build        | `nx affected -t build --configuration=production`    | Affected projects             |

Format is the exception: it is not `nx affected`. Prettier checks the workspace. CI never auto-writes. If formatting is wrong, the gate fails and the fix is a local `pnpm format`.

Locally I can run the same full workspace scripts (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`) or the affected helpers that match CI more closely (`pnpm affected:lint`, and so on). There are no Husky hooks. Nothing stops an unformatted commit from being pushed. CI is the backstop.

## How Nx decides what to check

`nrwl/nx-set-shas` sets the base and head SHAs for the PR. `nx affected` then walks the project graph and runs a target only on projects touched by that range.

Portfolio and Blog do not import each other. A CSS change in Portfolio should not rebuild Blog. A Markdown article under `apps/blog/content/articles/` should mark Blog affected, because that tree is part of the Blog project.

Shared workspace files are listed as `sharedGlobals` in `nx.json`:

- `.github/workflows/**/*`
- `nx.json`
- `tsconfig.base.json`
- `package.json`
- `pnpm-lock.yaml`
- `eslint.config.mjs`

Changing the workflow, the lockfile, or the root ESLint config is supposed to invalidate the affected set. That is the point of putting infrastructure in `sharedGlobals` instead of hoping Nx notices.

Nx also caches `lint`, `typecheck`, `test`, and the Angular production build locally. There is no Nx Cloud and no remote cache. CI starts cold each run; the cache helps local iteration, not a distributed build farm.

## Lint, types, tests, and the production build

Each app owns the same four targets. The implementations are small on purpose.

**Lint** is `@nx/eslint:lint` with the workspace flat config. Module-boundary enforcement exists, but the current constraint is still the default `*` → `*`. The interesting rule is cultural: applications must not import sibling applications. The linter is not yet a full tag graph.

**Typecheck** is `tsc --noEmit` against each app `tsconfig.app.json`. Blog’s typecheck `dependsOn` `prepare-content`, because generated article modules must exist before `tsc` can see them.

**Tests** are Node’s built-in test runner (`node:test`) against pure logic:

- Blog content validation, article query helpers, and date formatting
- Portfolio JSON-LD / featured-article helpers

There is no Angular component test harness yet. The gate is useful for the code that can break a content pipeline or a homepage card list. It does not screenshot a layout or click a route. When component tests become necessary, the documented preference is Angular’s first-party Vitest runner — not a second framework chosen for its own sake.

**Build** is the production Angular application build (`outputMode: "static"`). Blog’s build `dependsOn` `prepare-content`, so CI does not bypass the Markdown pipeline:

```text
Markdown + frontmatter
        ↓
  prepare-content
        ↓
  generated modules + sitemap/rss
        ↓
  Angular static production build
```

Invalid frontmatter, a bad slug, or a draft that should not be prerendered fails in that pipeline. A Blog article PR is not “just Markdown.” It is a production build of Blog.

Vercel does **not** use `nx affected`. Each Vercel project builds one app:

- Portfolio: `pnpm exec nx build portfolio --configuration=production`
- Blog: `pnpm exec nx build blog --configuration=production` from the workspace root

CI asks “what changed?” Vercel asks “build this project.” Those are different questions, and keeping them different is the design.

## Where Vercel Preview fits

Vercel is connected to GitHub. Opening a Pull Request produces preview deployments for the connected projects. The architecture docs treat that as the preview path: one preview per app project, in parallel with Actions.

What the repository does **not** do:

- GitHub Actions does not trigger, wait for, or verify a Vercel preview
- CI does not post preview URLs
- There is no required Vercel status check in the workflow file

The Quality Gate can be green while a preview is still building, and a preview can exist while CI is red. Review uses both: Actions for “did the affected projects lint, typecheck, test, and build,” Vercel for “does this revision look right in a browser.”

A real limitation follows from the root rewrite. Portfolio’s `vercel.json` mounts Blog by rewriting `/blog` to the Blog production deployment (`saleemkhan-blog.vercel.app`). A Portfolio preview still points `/blog` at that production Blog, not at a Blog preview of the same PR. Cross-app preview composition is not solved. For a Blog change, the Blog project’s own preview URL is the honest place to look.

## Why `main` is protected

`main` is the integration branch. The intended GitHub settings — documented in the development workflow, applied in the GitHub UI, not encoded as YAML in this repo — are:

- A Pull Request is required
- The `Quality Gate` check must pass
- Force pushes and branch deletion are blocked
- Direct pushes to `main` are not the working path

Required approvals are optional on a personal repository. Conversation resolution matters more than a fake two-person review of a one-person repo.

Protection lives in GitHub. The workflow only _produces_ a check named `Quality Gate`. If that check is not required in the ruleset, the YAML still runs and anyone with push access can still merge around it. The file is not the lock.

## What happens after merge

Merge to `main` is the production event.

```text
PR merged
    |
    +-- GitHub Actions: Quality Gate on push to main
    |
    +-- Vercel: production deploy per connected project
            |
            +-- Portfolio → saleemkhan.dev/
            +-- Blog      → /blog via root rewrites
```

Actions runs again on the merged commit. That is a confirmation of the integrated tree, not a deploy step. Production still comes from Vercel’s GitHub integration: each project builds its configured command and publishes static output.

Portfolio owns `/`. Blog is an independent Vercel project. The root project rewrites `/blog` and `/blog/:path*` to the Blog deployment, then falls through to the Portfolio SPA rewrite for other client routes. Blog has no catch-all SPA rewrite, so unknown article paths can be a real CDN 404.

Content changes go live only after that production build. There is no runtime Markdown fetch and no CMS publish button. The article is in Git, or it is not on the site.

## Why this shape

The workflow exists because the repo grew from one static Portfolio into an Nx workspace with two independently deployable apps. I wanted the next change — a Blog article, a Portfolio layout tweak, a `vercel.json` rewrite — to hit the same gate.

The split is the important decision:

```text
GitHub Actions  =  may this land on main?
Vercel          =  build and host this revision
```

Putting deploy tokens in Actions would couple those jobs. Letting Vercel be the only check would skip format, affected lint, typecheck, and the unit tests Vercel never runs. Duplicating Vercel deploys inside Actions would add secrets and a second source of truth for “what shipped.”

Nx affected is justified by the second app, not by a future fifty-app diagram. Caching, the project graph, and `sharedGlobals` are already useful. Nx Cloud, Module Federation, and a Kubernetes chart are not.

## What this workflow still does not do

Honesty is part of the case study.

| Missing                         | Why it waits                                              |
| ------------------------------- | --------------------------------------------------------- |
| Husky / lint-staged             | CI is enough backstop for a one-person repo               |
| Nx Cloud / remote cache         | Local cache + cold CI is fine at this size                |
| Angular component / e2e tests   | No UI contract yet that justifies the harness             |
| Deploy from GitHub Actions      | Vercel already owns preview and production                |
| Cross-app preview at `/blog`    | Root rewrites still target Blog production                |
| Required PR approvals           | Optional on a personal repository                         |
| Branch protection in Git        | GitHub rulesets are settings, not files                   |

The Quality Gate is one job, sequential, thirty minutes timeout, no matrix. That is appropriate for two static Angular apps. It is not a platform CI product.

## How it should evolve

The next improvements are the ones the current pain will actually create:

1. **Component tests** when a UI contract is worth locking — Angular Vitest, not a parallel stack.
2. **Nx Cloud** if CI time becomes a real cost as more apps appear.
3. **Local git hooks** if format/lint failures in CI become noisy enough to pay for Husky.
4. **Preview composition** if reviewing `/blog` through a Portfolio preview starts to matter.
5. **Tighter Nx tags** when a third consumer makes `*` → `*` too weak.

Not on the list: deploying from Actions, introducing a backend so CI can run migrations, or copying an enterprise pipeline because it photographs well.

The workflow should stay this simple for as long as the platform stays this small:

```text
Feature branch → Pull Request → Quality Gate + Preview → main → production
```

Every change still has to earn `main`. That is the whole design.
