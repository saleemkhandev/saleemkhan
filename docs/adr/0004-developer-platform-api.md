# ADR-0004: Introduce Developer Platform API

## Status

Accepted

## Context

`saleem-platform` currently contains two independently deployable Angular applications:

- Portfolio at `apps/portfolio` → `https://saleemkhan.dev/`
- Blog at `apps/blog` → `https://saleemkhan.dev/blog`

Both are static (`outputMode: "static"`) and deploy to Vercel. Blog content remains Git-owned Markdown behind a Blog-local `ArticleRepository` (ADR-0003).

The next product needs are not another static frontend. They are:

- a persistence-backed Projects catalog for a future Projects application
- platform metadata that other applications and a future MCP server can read
- a public HTTP contract that Admin, Blog (optionally), and MCP can consume later without talking to a database

A backend was deferred until those needs were real (`docs/architecture.md`). They are now a documented learning objective and a concrete platform requirement. The backend must still follow `simple → understandable → extensible`: one deployable, strong internal boundaries, no microservices.

`apps/api` does not exist yet. This ADR records the decision to introduce it; implementation is a later change.

## Decision

Create an independently deployable backend application at:

```text
apps/api
```

The initial architecture is a **modular monolith**: one process, one deployable, multiple internal modules.

Planned V1 responsibilities:

- health and readiness
- platform metadata
- projects

Planned V1 HTTP surface (not implemented):

```text
GET /v1/health
GET /v1/ready
GET /v1/platform
GET /v1/projects
GET /v1/projects/:slug
```

V1 target posture:

- public
- read-only
- no authentication
- no Admin
- no article persistence
- no MCP
- no write APIs

Planned public hostname:

```text
https://api.saleemkhan.dev
```

The API is a different operational boundary from the public website. Path-based URLs on `saleemkhan.dev` remain for content applications (ADR-0002). The API uses a subdomain for the same reason Admin will: separate security, deploy, and CORS concerns. Do not use `saleemkhan.dev/api` as the primary API host.

Future responsibilities may include articles, Admin writes, authentication, GitHub integration, and MCP-facing read APIs. Those modules are added only when there is a real requirement.

The API will be deployed independently from Portfolio and Blog. Planned hosting is Railway with managed PostgreSQL (see ADR-0006 and the deployment architecture). It is not implemented in this milestone.

Blog Markdown remains the article source of truth (ADR-0003). The planned V1 API does not replace the Blog content pipeline and does not include an articles table.

## Alternatives Considered

### Express routes on the Angular SSR servers

Rejected. Portfolio and Blog production output is static. The Express adapters in `src/server.ts` are Angular SSR scaffolding, not a product API. Coupling a public backend to those entrypoints would fight the Vercel static model and mix application boundaries.

### Microservices (health, projects, platform as separate deploys)

Rejected. There is one operator, one schema, and no independent scaling requirement. Distributed complexity is not justified.

### Shared library instead of an application (`libs/api`)

Rejected. The API is an independently deployable unit with its own runtime, environment, and datastore. Applications live under `apps/` (ADR-0001). Extract libraries only when a second TypeScript consumer needs the same implementation.

### Replacing Blog Markdown in the same milestone

Rejected. ADR-0003 remains Accepted. Dual article sources would be worse than the current Git-native pipeline.

## Consequences

### Positive

- A single, explicit backend boundary for future Projects, Admin, and MCP
- Independent deployment from static frontends
- Room to grow internally (modules) without premature distribution
- Blog and Portfolio can stay static until they opt into HTTP consumption

### Negative

- A second production runtime and datastore to operate (when implemented)
- Documentation and roadmap must distinguish current (Portfolio, Blog) from planned (`apps/api`)
- Root workspace dependencies will grow when the API is implemented
