# Saleem Platform — Architecture Overview

## Purpose

`saleem-platform` is an Nx monorepo for a personal engineering platform. Public frontends are Angular. A Developer Platform API (`apps/api`, NestJS + Fastify) exists as a health/ready foundation; persistence and remaining V1 domains are later milestones.

It combines:

- A professional portfolio
- Engineering content
- Project demonstrations
- Interactive engineering experiments
- Architecture demonstrations
- Content administration

The platform is intentionally designed to grow from a simple portfolio into a production-quality engineering platform: static public frontends plus a Developer Platform API.

## High-level architecture

Current public site:

```text
                         saleemkhan.dev
                               │
                         Routing Layer
                               │
                    ┌──────────┴──────────┐
                    ↓                     ↓
                   `/`                 `/blog`
                    │                     │
                    ↓                     ↓
              Portfolio App           Blog App
```

Planned (Projects frontend, PostgreSQL, and Railway are not in the repository yet; `apps/api` foundation exists):

```text
                         saleemkhan.dev              api.saleemkhan.dev
                               │                              │
                         Routing Layer                    Railway
                    ┌──────────┼──────────┐                   │
                    ↓          ↓          ↓                   ↓
                   `/`      `/blog`  `/projects`         apps/api
                    │          │          │                   │
                    ↓          ↓          ↓                   ↓
              Portfolio      Blog      Projects          PostgreSQL
                    │          │          │
                    └──── HTTPS (future) ─┴───────────────────┘
```

Admin is a separate application boundary (later):

```text
admin.saleemkhan.dev
        │
        ↓
    Admin App
        │
        ↓
 Authentication
        │
        ↓
      API
        │
        ↓
   PostgreSQL
```

Future MCP is also an API consumer, not a database client:

```text
AI client → MCP server → HTTPS → Developer Platform API → PostgreSQL
```

## Planned applications

### Portfolio

Primary professional website.

URL:

`https://saleemkhan.dev/`

### Blog

Engineering articles and technical writing.

URL:

`https://saleemkhan.dev/blog`

### Projects

Project showcase.

URL:

`https://saleemkhan.dev/projects`

### Playground

Interactive engineering experiments.

URL:

`https://saleemkhan.dev/playground`

### Architecture Lab

Interactive architecture visualizations and demonstrations.

URL:

`https://saleemkhan.dev/architecture`

### Developer Platform API (foundation)

Independently deployable modular monolith at `apps/api`. This milestone exposes health and readiness only.

Planned URL:

`https://api.saleemkhan.dev`

See ADR-0004 through ADR-0007.

### Admin

Authenticated content-management application.

URL:

`https://admin.saleemkhan.dev/`

## Monorepo structure

```text
saleem-platform/
├── apps/
│   ├── portfolio/
│   ├── blog/
│   ├── api/                 # planned
│   ├── projects/
│   ├── playground/
│   ├── architecture-lab/
│   └── admin/
│
├── libs/
│   ├── ui/
│   ├── auth/
│   ├── data-access/
│   ├── analytics/
│   ├── feature/
│   └── utils/
│
├── infrastructure/
│   ├── terraform/
│   └── deployment/
│
├── docs/
│   ├── architecture/
│   └── adr/
│
└── tools/
```

This is the intended evolution, not a requirement that every directory exist from day one.

## Dependency model

Preferred layering:

```text
apps
  ↓
feature
  ↓
data-access / ui
  ↓
utils
```

Applications should not directly depend on sibling applications. Independently deployed apps integrate over HTTP (ADR-0007). Shared `libs/data-access` waits until a second frontend shares one client.

Current Blog does not consume the API. Markdown remains the source of truth (ADR-0003).

Long-term example, after libraries exist:

```text
apps/projects
      ↓
libs/feature/projects
      ↓
libs/data-access
      ↓ HTTPS
apps/api
      ↓
PostgreSQL
```

Both may consume shared platform libraries:

```text
libs/ui
libs/auth
libs/analytics
libs/utils
```

## Backend evolution

The backend was deferred until Portfolio and Blog existed as static products.

That decision is now superseded by ADR-0004: a Developer Platform API exists as a NestJS/Fastify foundation. PostgreSQL and remaining V1 domains are not implemented yet.

Planned flow:

```text
Frontend applications / future MCP
    ↓ HTTPS
Developer Platform API (apps/api)
    ↓
PostgreSQL
```

Only the API owns persistence. Blog Markdown remains the article source of truth until a later, explicit migration (ADR-0003, ADR-0007).

Admin and authentication should be introduced when there is a real content-management requirement (roadmap Phase 7). MCP follows as an HTTP client (Phase 8).

## Architectural philosophy

The platform should grow because requirements create architectural problems.

Preferred sequence:

```text
Real requirement
      ↓
Architectural problem
      ↓
Design decision
      ↓
Implementation
      ↓
ADR
```

Do not add technology merely because it is common in enterprise architectures.

## Relationship to the generic monorepo reference

The generic reference architecture emphasizes thin applications, layered libraries, explicit boundaries, shared design-system/platform capabilities, and selective micro-frontends. These principles are used as learning/reference material rather than copied as a literal architecture for `saleem-platform`.
