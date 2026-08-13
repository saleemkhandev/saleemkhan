# Architecture

This document captures the intentional decisions behind `saleemkhan` so the repository can grow without accumulating accidental complexity.

## Why Angular?

Angular is a deliberate product and career signal for this repository.

- It is Saleem Khan’s strongest frontend ecosystem.
- The portfolio itself should demonstrate modern Angular architecture.
- Standalone components, Signals, typed DI, SSR/SSG, and strict TypeScript provide a mature foundation for a long-lived engineering platform.

This project intentionally does **not** use React, Next.js, Vue, Svelte, or Astro for public frontend applications.

## Why a monorepo?

The long-term shape of this platform includes multiple applications and, later, shared libraries:

- `portfolio`
- `blog`
- `api` (Developer Platform API foundation)
- `playground`
- `architecture-lab`
- `interview-lab`
- `experiments`

A monorepo keeps shared conventions, tooling, and libraries in one place while preserving clear application boundaries.

The monorepo is incremental by design. Current applications: `apps/portfolio`, `apps/blog`, and `apps/api` (health/ready foundation; ADR-0004). PostgreSQL, Projects, and Railway are later milestones.

## Why Nx?

Nx was chosen for the initial workspace.

Reasons:

- The repository is expected to grow into multiple apps (Angular frontends and a NestJS API) and shared libraries.
- Affected builds, project graph visibility, and caching become valuable as soon as a second app or shared library appears.
- `@nx/angular` provides a first-class Angular developer experience.
- The workspace remains understandable with a small number of thin applications.

Nx was **not** chosen because “monorepo automatically means Nx.” A plain Angular CLI workspace would have been enough for a single static site. Nx is justified here by the planned multi-app engineering lab.

## Current application shape

```text
apps/portfolio/src/app/
├── core/constants/     # site content, typed config, featured article metadata
├── layout/
│   ├── profile-panel/  # fixed left identity panel
│   └── site-footer/
└── features/home/
    ├── home-page/      # shell composition + SEO metadata
    ├── intro/          # rotating role intro
    ├── biography/
    ├── experience/
    ├── engineering-focus/
    ├── journey/
    └── engineering-notes/  # latest Blog articles via public URLs
```

The public landing page currently uses a Deebo-inspired split layout:

- fixed left profile panel with portrait and identity
- scrolling main column for intro, biography, experience, focus, journey, and engineering notes

This is an intentional product choice for the current frontend milestone. Shared libraries are still deferred until real reuse appears.

## Portfolio → Blog presentation

Portfolio links to Blog through public URLs only (`/blog`, `/blog/<slug>`). It does not import `apps/blog`.

Latest-article cards on the homepage use Portfolio-local featured metadata in `apps/portfolio/src/app/core/constants/featured-articles.ts`. That list is intentionally duplicated presentation data. Markdown under `apps/blog/content/articles/` remains Blog's source of truth (ADR-0003).

A public content API can replace the duplicated metadata later. Do not introduce a shared content library until a second consumer actually needs the same implementation. The planned Developer Platform API (ADR-0004) does **not** persist articles in V1.

## Why standalone Angular components?

Standalone components are the modern Angular default.

They:

- reduce NgModule ceremony
- make feature boundaries easier to see
- pair cleanly with lazy-loaded routes
- keep the architecture closer to current Angular guidance

NgModules are avoided for application architecture unless a dependency requires them.

## Why Signals?

Signals provide local, typed, fine-grained state with less ceremony than RxJS for UI state.

Current usage is intentionally modest:

- intro role rotator state (`activeIndex`, `animating`)
- no global store
- no Signals-for-everything abstraction layer

RxJS remains available where stream semantics are useful (for example, the intro rotation interval).

## Why SSG/prerender instead of a long-lived Node SSR server?

The first milestone is a public marketing/engineering landing page. Blog followed the same static model.

Chosen approach:

- Angular SSR packages are installed
- routes are configured for prerender
- production `outputMode` is `static`

This gives:

- strong SEO through pre-rendered HTML
- fast first paint
- simple static deployment on Vercel
- no requirement to operate a Node server for Portfolio or Blog

Full dynamic SSR remains available later if authenticated or highly dynamic routes appear. It is not needed for the current landing page or Markdown blog.

The planned Developer Platform API is a different runtime: a long-lived Node process. It does not change the frontend rendering choice.

## Why the backend waited, and why it exists as a plan now

The platform started frontend-first because Portfolio and Blog were the immediate product requirements. There was no user need for APIs, forms backends, a CMS, or authenticated experiences.

A backend was intentionally deferred until there was a concrete use case. Adding one earlier would have been infrastructure without a corresponding product.

That use case is now accepted (ADR-0004):

- Projects data for a future Projects application
- platform metadata
- a public HTTP contract for future dynamic content, Admin, and MCP

This is an architectural evolution, not a rewrite. Portfolio and Blog stay static. Blog Markdown stays the article source of truth (ADR-0003). `apps/api` exists as a NestJS/Fastify foundation (`GET /v1/health`, `GET /v1/ready`). Persistence and remaining V1 domains are later PRs.

Planned V1 API posture: public, read-only, no authentication, no article table. See ADR-0004 through ADR-0007.

## Why PostgreSQL is planned (and not used by frontends)

The first persistence model that requires a database is API-owned Projects data, not Blog articles.

PostgreSQL is the planned system of record (ADR-0006). Only `apps/api` will own the connection, schema, and migrations. Portfolio, Blog, a future Projects app, Admin, and MCP must not access PostgreSQL directly (ADR-0007).

## Why no NgRx initially?

The landing page has no shared client state that justifies a global store.

State management will be evaluated when real cross-route or cross-feature state appears.

## Why Vercel for frontends, and Railway for the planned API?

Vercel fits the frontend deployment goals:

- GitHub-connected deploys
- static hosting for prerendered Angular output
- straightforward custom-domain attachment for `saleemkhan.dev`

The planned API is not a static site. A long-lived Node process, PostgreSQL connections, and migrations fit Railway better than Vercel Functions (see deployment architecture). Railway is **planned**, not deployed.

## Content honesty

The portfolio should not invent achievements, employers, degrees, or titles.

- Current title: Senior Software Engineer
- Staff Engineer / Architect: growth direction, not current titles
- Focus areas describe interests and strengths, not scored skill meters

## Why the architecture is intentionally incremental?

Over-engineering would undermine the very engineering judgment this portfolio is meant to demonstrate.

The growth path is:

1. ship a polished Angular landing page
2. establish conventions and documentation
3. add Blog as an independently deployable static app
4. introduce a Developer Platform API when Projects, platform metadata, and future MCP need a real HTTP + persistence boundary
5. extract shared libraries only after real reuse appears
6. add Admin, auth, and MCP only when those products exist

Preferred direction:

`simple → understandable → extensible`

Not:

`complex → impressive-looking → unnecessary`
