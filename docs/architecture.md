# Architecture

This document captures the intentional decisions behind `saleemkhan` so the repository can grow without accumulating accidental complexity.

## Why Angular?

Angular is a deliberate product and career signal for this repository.

- It is Saleem Khan’s strongest frontend ecosystem.
- The portfolio itself should demonstrate modern Angular architecture.
- Standalone components, Signals, typed DI, SSR/SSG, and strict TypeScript provide a mature foundation for a long-lived engineering platform.

This project intentionally does **not** use React, Next.js, Vue, Svelte, or Astro.

## Why a monorepo?

The long-term shape of this platform includes multiple Angular applications and shared libraries:

- `portfolio`
- `blog`
- `playground`
- `architecture-lab`
- `interview-lab`
- `experiments`

A monorepo keeps shared conventions, tooling, and libraries in one place while preserving clear application boundaries.

The monorepo is incremental by design. Current applications: `apps/portfolio` and `apps/blog`.

## Why Nx?

Nx was chosen for the initial workspace.

Reasons:

- The repository is expected to grow into multiple Angular apps and shared libraries.
- Affected builds, project graph visibility, and caching become valuable as soon as a second app or shared library appears.
- `@nx/angular` provides a first-class Angular developer experience.
- The workspace remains understandable with a small number of thin applications.

Nx was **not** chosen because “monorepo automatically means Nx.” A plain Angular CLI workspace would have been enough for a single static site. Nx is justified here by the planned multi-app engineering lab.

## Current application shape

```text
apps/portfolio/src/app/
├── core/constants/     # site content and typed config
├── layout/
│   ├── profile-panel/  # fixed left identity panel
│   └── site-footer/
└── features/home/
    ├── home-page/      # shell composition + SEO metadata
    ├── intro/          # rotating role intro
    ├── biography/
    ├── engineering-focus/
    └── journey/
```

The public landing page currently uses a Deebo-inspired split layout:

- fixed left profile panel with portrait and identity
- scrolling main column for intro, biography, focus, and journey

This is an intentional product choice for the current milestone. Shared libraries are still deferred until real reuse appears.

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

The first milestone is a public marketing/engineering landing page.

Chosen approach:

- Angular SSR packages are installed
- routes are configured for prerender
- production `outputMode` is `static`

This gives:

- strong SEO through pre-rendered HTML
- fast first paint
- simple static deployment on Vercel
- no requirement to operate a Node server for the initial site

Full dynamic SSR remains available later if authenticated or highly dynamic routes appear. It is not needed for the first landing page.

## Why no backend initially?

There is no product requirement for APIs, forms backends, CMS, or authenticated experiences yet.

Adding a backend now would create infrastructure without a corresponding user need.

## Why no database initially?

Same reason as the backend: no content model currently requires persistence beyond static files in the repository.

## Why no NgRx initially?

The landing page has no shared client state that justifies a global store.

State management will be evaluated when real cross-route or cross-feature state appears.

## Why Vercel?

Vercel fits the initial deployment goals:

- GitHub-connected deploys
- static hosting for the prerendered Angular output
- zero paid hosting requirement for the first milestone
- straightforward custom-domain attachment for `saleemkhan.dev`

AWS, Cloudflare, databases, and observability can be introduced later when there is a concrete operational need.

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
3. add routes and content when they have substance
4. extract shared libraries only after real reuse appears
5. introduce infrastructure only when requirements demand it

Preferred direction:

`simple → understandable → extensible`

Not:

`complex → impressive-looking → unnecessary`
