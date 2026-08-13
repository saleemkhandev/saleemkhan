# Development Roadmap

## Guiding principle

Do not implement the entire target architecture at once.

Grow the platform in stages, with each stage solving a real problem.

## Phase 1 — Portfolio foundation (delivered)

```text
apps/portfolio/
```

Focus:

- Public site at `https://saleemkhan.dev/`
- Angular static prerender
- Vercel deployment

## Phase 2 — Blog (delivered)

```text
apps/
├── portfolio/
└── blog/
```

Focus:

- Blog at `/blog`
- Markdown → `prepare-content` → `ArticleRepository` → static prerender
- Independently deployable Vercel project
- ADR-0003 remains the content architecture

## Phase 3 — CI/CD foundation (delivered)

```text
.github/workflows/ci.yml
docs/architecture/development-workflow.md
```

Focus:

- Pull request quality gate: format → affected lint → typecheck → test → production build
- GitHub Actions as the quality gate; Vercel as frontend deploy
- Nx affected builds

## Phase 4 — Developer Platform API (current: architecture accepted, not implemented)

```text
apps/api/    # planned; not in the repository yet
```

Accepted decisions: ADR-0004, ADR-0005, ADR-0006, ADR-0007.

Planned shape:

- Modular monolith at `apps/api`
- NestJS 11 + Fastify adapter
- Zod validation
- Drizzle + PostgreSQL
- OpenAPI
- Nx targets participating in the existing affected CI
- Railway + managed PostgreSQL
- `https://api.saleemkhan.dev`

Planned V1 surface (not implemented):

```text
GET /v1/health
GET /v1/ready
GET /v1/platform
GET /v1/projects
GET /v1/projects/:slug
```

V1 target: public, read-only, no auth, no Admin, no article persistence, no MCP, no write APIs.

This phase is documentation-first. Implementation is a later PR.

## Phase 5 — Projects application

```text
apps/projects/
```

A public Projects frontend at `/projects` consumes the API over HTTPS. It does not import `apps/api` and does not access PostgreSQL.

Shared `libs/data-access` waits until a second frontend shares the same client.

## Phase 6 — Blog dynamic-content option

Optional. ADR-0003 stays Accepted until a new ADR supersedes it.

Possible later paths:

```text
API → ApiArticleRepository → Blog
```

or:

```text
API → prepare-content → prerendered Blog
```

Markdown remains the source of truth until that migration is explicitly chosen. Do not dual-write articles.

## Phase 7 — Authentication / Admin

```text
https://admin.saleemkhan.dev/
```

Authenticated write APIs on the same modular monolith. Public V1 GET endpoints can remain unauthenticated.

## Phase 8 — MCP server

```text
AI client → MCP server → HTTPS → Developer Platform API → PostgreSQL
```

The MCP server is an API consumer. It must not access PostgreSQL, SQL, or the schema directly.

Potential later tools: list/inspect projects, list/search articles, inspect platform metadata. None of these exist yet.

## Phase 9 — GitHub integration

Import or sync project metadata through the API when there is a real authoring or freshness requirement.

## Phase 10 — Background jobs / events

Only if a concrete requirement appears (for example, scheduled GitHub sync that cannot run in-request).

Do **not** treat the following as default architecture:

- Kafka
- Redis
- microservices
- Kubernetes
- service mesh
- CQRS
- event sourcing

They remain deferred until a specific problem justifies them.

## What not to optimize for

Do not optimize for:

- Number of apps
- Number of libraries
- Number of cloud services
- Micro-frontend adoption
- Architectural complexity

Optimize for:

- Clear boundaries
- Low coupling
- Reusability where justified
- Independent deployment where useful
- Maintainability
- Explicit architectural decisions
- Demonstrable engineering depth
