---
title: 'Frontend Architecture for a Personal Platform'
description: 'How this Angular platform stays thin: app boundaries, a Blog-local content contract, and Portfolio linking to Blog through public URLs only.'
publishedAt: '2026-08-05'
status: 'published'
tags:
  - frontend-architecture
  - angular
  - architecture
---

# Frontend Architecture for a Personal Platform

Good personal-platform architecture is mostly about _what you refuse to build early_.

This site is two Angular applications in one Nx repo. The interesting design is not the folder tree. It is the dependency arrow, the content boundary, and the rule that Portfolio may link to Blog without ever importing it.

## Preferred layering

Keep the dependency arrow pointing downward:

```text
Apps
  ↓
Feature libraries (when shared)
  ↓
Data-access / UI libraries
  ↓
Utilities
```

For V1, most of that stack still lives **inside** each app. That is intentional. A library without a second consumer is not a platform capability — it is a speculative package.

Portfolio and Blog are both thin apps. A thin app still owns:

1. Bootstrapping
2. Routing
3. Layout composition
4. Application-specific wiring

It should not own a fake “enterprise” content platform, a shared UI kit with one consumer, or a backend that nothing authenticates against.

> If removing an abstraction does not hurt a real consumer, the abstraction was early.

## What each app actually looks like

Portfolio is a single prerendered homepage: identity panel, intro, biography, experience, skills, journey, then a short Engineering notes section that points at Blog.

Blog is a small content app:

```text
apps/blog/
├── content/articles/     # Markdown source of truth
└── src/app/
    ├── core/             # article model, repository, SEO
    ├── features/         # list, detail, not-found
    └── layout/           # header, footer
```

Internal Blog routes are `/` and `/:slug`. After the production mount they are `/blog` and `/blog/<slug>`. Presentation components never read Markdown files.

## The content boundary

Markdown with YAML frontmatter lives under `apps/blog/content/articles/`. The filename is the slug. A build-time step (`blog:prepare-content`) turns that into typed modules. Angular then prerenders published routes.

```text
Markdown + frontmatter
        ↓
  prepare-content
        ↓
  generated modules
        ↓
  ArticleRepository
        ↓
  list / detail UI
```

Pages depend on an article model, not on filesystem paths:

```ts
export type ArticleStatus = 'draft' | 'published';

export interface ArticleSummary {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  status: ArticleStatus;
  tags: readonly string[];
}

export interface Article extends ArticleSummary {
  contentHtml: string;
}
```

`ArticleRepository` is Blog-local. It is not `libs/data-access`. List and detail talk to that boundary. When an Admin/API exists later, the repository implementation can change without rewriting the feature UI.

Drafts stay in Git and stay out of production prerender, sitemap, and RSS. That is a frontmatter concern, not an Admin product.

## How Portfolio talks to Blog

The public contract is URLs, not source code:

```text
Portfolio
    |
    |  /blog
    |  /blog/<slug>
    ↓
   Blog
```

Not:

```text
Portfolio → apps/blog/src
Portfolio → shared Blog library
Portfolio → backend → Blog
```

The homepage Engineering notes section needs titles, descriptions, dates, and tags. For this first integration, Portfolio keeps a small local list of featured article metadata and builds `/blog/<slug>` from the slug.

That list is **duplicated presentation data**. It is not Blog’s source of truth. The Markdown files still are. Duplicating two summaries is cheaper — and more honest — than inventing an API or coupling the apps so Portfolio can import Blog’s generated manifest.

Later, a public content API can replace both Blog’s Markdown-backed repository and Portfolio’s featured list. That future architecture is not required to put three cards on a homepage.

## What this stack deliberately skips

| Temptation                        | Why it waits                                     |
| --------------------------------- | ------------------------------------------------ |
| Shared UI / data-access libraries | Only one consumer today                          |
| Module Federation                 | Independent deploys already give `/blog`         |
| Backend, CMS, database            | Git-owned Markdown is enough for V1              |
| NgRx                              | No cross-route client state that needs a store   |
| Runtime Markdown fetching         | Breaks static generation and pushes parsing late |

Both apps use standalone components, local Signals where UI state is tiny, and static prerender for SEO. Full dynamic SSR remains available if authenticated or highly dynamic routes appear. It is not needed for a landing page and a static blog.

## Principles that actually help

- Prefer incremental change over speculative frameworks.
- Document decisions as ADRs when they change how the platform evolves.
- Keep presentation free of content-source details.
- Link across apps with public URLs.
- Extract a library when a second consumer exists, not when the planned tree looks incomplete.

Link out when demos belong elsewhere — for example to a future playground — rather than embedding interactive widgets in posts today.

The platform should grow because a requirement creates an architectural problem. Not because the folder tree is lonely.
