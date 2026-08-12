---
title: 'Building an Angular Monorepo'
description: 'Why this site became an Nx workspace when Blog appeared — and how two Angular apps stay independently deployable under one domain.'
publishedAt: '2026-08-01'
status: 'published'
tags:
  - angular
  - nx
  - monorepo
---

# Building an Angular Monorepo

A personal site does not need a monorepo on day one. It needs **clear boundaries** when the second application appears.

This platform started as a Portfolio at `https://saleemkhan.dev/`. Blog is the second application: independently registered in Nx, independently deployed on Vercel, and mounted at `/blog`. Portfolio does not import Blog source. Blog does not import Portfolio source.

That split is the whole point of the workspace.

## The problem a second app actually creates

One Angular app in one repo is simple. The interesting moment is the second public surface:

```text
https://saleemkhan.dev/        → Portfolio
https://saleemkhan.dev/blog    → Blog
```

Those URLs should feel like one website. The code should not pretend they are one application.

If Blog lived inside Portfolio routing, every article change would couple to the landing page. If they were separate Git repositories, shared conventions (Node version, lint, CI, TypeScript strictness) would drift immediately. A monorepo is the middle path: one repo, two deployable apps, explicit ownership.

## What we keep separate

Applications must not depend on sibling applications:

1. Portfolio owns the root experience.
2. Blog owns engineering writing.
3. Shared libraries appear only after _real_ reuse.

That order matters more than matching a target folder tree. `libs/ui` and `libs/data-access` are planned names, not empty packages waiting to be filled.

## Workspace shape today

What exists:

```text
saleemkhan/
├── apps/
│   ├── portfolio/    # public home
│   └── blog/         # articles
├── docs/
│   ├── architecture/
│   └── adr/
└── ...
```

What is allowed to exist later, when a requirement appears:

```text
apps/projects
apps/playground
apps/architecture-lab
apps/admin
libs/ui
libs/data-access
```

> Architecture should follow requirements, not the other way around.

## Why Nx

Nx was not chosen because “monorepo automatically means Nx.” A plain Angular CLI workspace would have been enough for a single static site.

Nx is justified here because the repo is expected to grow into several Angular apps:

- Project graph visibility (`portfolio` and `blog` are separate projects)
- Cached targets (`build`, `lint`, `test`, `serve`)
- Affected-style CI as more apps appear
- `@nx/angular` as a first-class Angular developer experience

It does **not** justify Module Federation, a design system package, or a backend.

## Independent deploys, unified URLs

The monorepo and the deployment topology are separate concerns.

Both apps prerender to static files (`outputMode: "static"`). Each has its own Vercel project:

```text
GitHub repository
        │
        ↓
   saleemkhan
     ┌──┴──┐
     ↓     ↓
 Portfolio Blog
     │     │
     ↓     ↓
  Vercel  Vercel
```

The public site still looks like one domain. The root project rewrites `/blog` and `/blog/*` to the Blog deployment. Portfolio keeps `/`.

Blog’s Angular routes stay simple (`/` and `/:slug`). Production `baseHref` is `/blog/`, so the public URLs become `/blog` and `/blog/<slug>` without Blog importing Portfolio.

Module Federation is **not** required to publish `/blog`. Path routing and independent Vercel projects are enough for V1. Runtime composition can be evaluated later if a real need appears.

## Local development

Serve each app on its own:

```bash
pnpm nx serve portfolio
pnpm nx serve blog
```

They do not share a runtime. Clicking from Portfolio to `/blog` in production is a navigation across application boundaries, not an in-app Angular route.

## The contract that matters

The important contract is cultural as much as technical:

_Blog code stays in Blog until sharing is earned._

When Portfolio needs to mention articles, it uses public URLs and its own small featured-article list. It does not reach into `apps/blog/src`. That is how a monorepo stays a platform instead of becoming a tangle.
