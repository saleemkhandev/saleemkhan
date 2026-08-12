# AGENTS.md — Saleem Platform

## Project identity

Repository: `saleem-platform`

This is Saleem's personal engineering platform and portfolio monorepo.

It has two goals:

1. Provide the public personal platform at `saleemkhan.dev`.
2. Serve as a practical demonstration of Senior Engineer, Staff Engineer, and Frontend Architect capabilities.

## Architectural source of truth

Use this priority order when making decisions:

1. Existing code and configuration
2. Accepted ADRs in `docs/adr/`
3. Architecture documentation in `docs/architecture/`
4. This `AGENTS.md`
5. Earlier planning discussions

Do not blindly implement an old plan when the current code or an accepted ADR says otherwise.

## Core principles

- Nx monorepo.
- Angular applications.
- Keep applications relatively thin: bootstrapping, routing, composition, and application-specific wiring.
- Put genuinely reusable capabilities into `libs/`.
- Applications must not directly depend on other applications.
- Prefer explicit dependency boundaries.
- Do not create abstractions without a real consumer or a clearly documented platform requirement.
- Prefer incremental evolution over speculative architecture.
- Do not introduce micro-frontends merely because this is a monorepo.
- Do not introduce backend services, queues, caches, Kubernetes, or cloud infrastructure without a concrete requirement or learning objective.
- Document significant architectural decisions as ADRs.

## Planned workspace

```text
saleem-platform/
├── apps/
│   ├── portfolio/
│   ├── blog/
│   ├── projects/
│   ├── playground/
│   ├── architecture-lab/
│   └── admin/
├── libs/
│   ├── ui/
│   ├── auth/
│   ├── data-access/
│   ├── analytics/
│   ├── feature/
│   └── utils/
├── infrastructure/
│   ├── terraform/
│   └── deployment/
├── docs/
│   ├── architecture/
│   └── adr/
└── tools/
```

This is the target evolution, not a requirement that all directories exist immediately.

## Current product direction

The existing portfolio is the starting application.

Planned public applications:

- Portfolio
- Blog
- Projects
- Playground
- Architecture Lab

Admin is a separate application boundary.

## Public URL strategy

The public platform should feel like one website:

- `https://saleemkhan.dev/` → Portfolio
- `https://saleemkhan.dev/blog` → Blog
- `https://saleemkhan.dev/projects` → Projects
- `https://saleemkhan.dev/playground` → Playground
- `https://saleemkhan.dev/architecture` → Architecture Lab

Admin:

- `https://admin.saleemkhan.dev/` → Admin

Do not change the portfolio to `/portfolio`; the root domain represents the portfolio.

## Deployment strategy

Current deployment platform: Vercel.

The monorepo and deployment topology are separate concerns.

Multiple applications may live in the same Nx monorepo and may be deployed as independent Vercel projects while presenting a unified public URL structure.

Do not introduce Module Federation solely to implement `/blog`, `/projects`, etc.

Evaluate Module Federation only when runtime composition or independent deployment creates a genuine benefit.

## Application dependency model

Preferred conceptual flow:

```text
Apps
  ↓
Feature libraries
  ↓
Data-access / UI libraries
  ↓
Utilities
```

For dynamic content:

```text
Application
  ↓
Data-access
  ↓
Backend API
  ↓
Database / external services
```

Applications should not directly depend on sibling applications.

## Shared libraries

Create a shared library when there is an actual reuse or platform responsibility.

Likely eventual libraries:

- `ui` — shared design system and reusable presentation
- `auth` — authentication/session concerns when Admin or other authenticated apps require them
- `data-access` — API clients and shared data contracts
- `analytics` — cross-application analytics
- `feature` — genuinely reusable feature capabilities
- `utils` — small, stable, cross-cutting utilities

Do not create empty placeholder libraries just to match the planned tree.

## Architecture reasoning rules

Before making an architectural change, answer:

1. What problem are we solving?
2. Is the problem real today?
3. Does an existing abstraction already solve it?
4. What boundary is being introduced?
5. Who consumes that boundary?
6. Does the change reduce or increase coupling?
7. Does the code need to be shared?
8. What operational complexity does it introduce?
9. Can it be introduced incrementally?
10. What is the rollback/reversal path?

## Avoid

- Speculative abstractions
- Empty libraries
- Direct app-to-app dependencies
- Premature micro-frontends
- Unnecessary backend services
- Unnecessary infrastructure
- Copying enterprise architecture without the underlying problem

## Coding expectations

Before changing existing code:

- Inspect the current implementation.
- Follow existing conventions.
- Prefer the smallest architectural change that solves the problem.
- Preserve working behavior.
- Add/update tests when behavior changes.
- Update documentation/ADR when the change materially affects architecture.

## Agent behavior

When a request could be solved in multiple architectural ways, explain the trade-off briefly before implementing a large structural change.

If the requested change conflicts with an accepted ADR, stop and surface the conflict rather than silently overriding the decision.
