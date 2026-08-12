---
title: 'Building an Angular Monorepo'
description: 'How saleem-platform grew from a single portfolio into an Nx workspace with independently buildable applications.'
publishedAt: '2026-08-01'
status: 'published'
tags:
  - angular
  - nx
  - monorepo
---

# Building an Angular Monorepo

A personal site does not need a monorepo on day one. It needs **clear boundaries** when the second application appears.

This platform started as a Portfolio at the root domain. Blog is the second application: independently registered in Nx, without importing Portfolio source.

## What we keep separate

Applications must not depend on sibling applications:

1. Portfolio owns the root experience.
2. Blog owns engineering writing.
3. Shared libraries appear only after _real_ reuse.

That order matters more than matching a target folder tree.

## Workspace shape

Prefer thin apps and explicit ownership:

- `apps/portfolio` — public home
- `apps/blog` — articles
- `libs/*` — only when two consumers exist

> Architecture should follow requirements, not the other way around.

For local development, serve each app on its own:

```bash
pnpm nx serve portfolio
pnpm nx serve blog
```

Inline reminders help too: run `nx lint blog` before a production build.

## Why Nx

Nx gives us:

- Project graph awareness
- Cached targets (`build`, `lint`, `serve`)
- A single repo without forcing micro-frontends

Module Federation is **not** required to publish `/blog` later. Path routing and independent Vercel projects are enough for V1.

The important contract is cultural as much as technical: _Blog code stays in Blog until sharing is earned._
