# ADR-0007: Define Application, API, and Database Boundaries

## Status

Accepted

## Context

The monorepo already forbids sibling application imports (ADR-0001). Portfolio talks to Blog through public URLs only. Blog content is Markdown behind `ArticleRepository` (ADR-0003).

ADR-0004 adds a planned backend at `apps/api` with PostgreSQL (ADR-0006). Without an explicit boundary, it would be tempting to:

- import API modules from Angular apps
- let Blog or MCP query PostgreSQL
- move articles into the API while Markdown is still the source of truth
- treat Express in Angular `server.ts` as the API

Those would collapse the independent-deploy model (ADR-0002) and the Blog architecture (ADR-0003).

## Decision

Independently deployable applications communicate through **public HTTP**, not through TypeScript imports and not through shared database connections.

### Planned dependency direction

```text
Portfolio
    ↓ HTTPS (future, when it consumes API data)
Developer Platform API
    ↓
PostgreSQL

Blog
    ↓ HTTPS (future, optional)
Developer Platform API
    ↓
PostgreSQL

Projects application
    ↓ HTTPS
Developer Platform API
    ↓
PostgreSQL

Future MCP server
    ↓ HTTPS
Developer Platform API
    ↓
PostgreSQL

Future Admin
    ↓ HTTPS (authenticated, later)
Developer Platform API
    ↓
PostgreSQL
```

### What the API owns

- database connection
- schema
- migrations
- repositories
- domain logic
- HTTP contract (planned `/v1` on `api.saleemkhan.dev`)

### What frontends own

- presentation
- frontend state
- frontend routing
- API consumption over HTTP

### What MCP eventually owns

- MCP protocol and tool exposure

MCP does **not** own PostgreSQL access, SQL, or the database schema.

### Hard rules

- Portfolio must never access PostgreSQL directly.
- Blog must never access PostgreSQL directly.
- Projects must never access PostgreSQL directly.
- MCP must never access PostgreSQL directly.
- Admin must never access PostgreSQL directly.
- Applications must not import sibling applications.
- Only `apps/api` owns the database connection and persistence layer.

### Blog coexistence

ADR-0003 remains **Accepted**. The current Blog architecture remains:

```text
Markdown
  → prepare-content
  → generated article data
  → ArticleRepository
  → Angular
  → prerendered static output
```

Markdown remains the source of truth. The planned V1 API does not replace this pipeline and does not persist articles.

A later, optional migration may look like:

```text
API → ApiArticleRepository → Blog
```

or:

```text
API → prepare-content → prerendered Blog
```

That work is not part of introducing `apps/api`. `ArticleRepository` is the swap seam; feature UI should not couple to Markdown or to PostgreSQL.

### Planned consumers

| Consumer  | Relationship to the API                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| Portfolio | Public website. May later replace duplicated featured metadata via HTTPS. Does not import `apps/api`.       |
| Blog      | Static Markdown today. Optional future HTTPS consumer. Does not import `apps/api`. Does not use PostgreSQL. |
| Projects  | Planned frontend. Primary V1 consumer of `GET /v1/projects`.                                                |
| MCP       | Planned later. HTTP client of the API only.                                                                 |
| Admin     | Planned later on `admin.saleemkhan.dev`. Authenticated writes, still via the API.                           |

Shared `libs/data-access` waits until a second frontend actually shares one client implementation. The first consumer may keep an app-local HTTP client.

## Alternatives Considered

### Frontends connect to PostgreSQL

Rejected. It duplicates credentials, bypasses the HTTP contract, and makes MCP and Admin alternate query paths. Persistence belongs in one place.

### MCP reads PostgreSQL directly

Rejected. MCP should be an API consumer so tools stay aligned with the public contract and OpenAPI.

### Path-based API on `saleemkhan.dev/api`

Rejected as the primary host. Website path routing is for public content apps (ADR-0002). An API is an operational and CORS boundary, similar to Admin’s subdomain.

### Extract `libs/api` or `libs/database` before a second backend exists

Rejected. Speculative libraries violate ADR-0001’s boundary rule.

## Consequences

### Positive

- Independent deploys stay honest
- Blog can remain static while the API grows
- MCP and Admin have a single data plane later
- Nx module-boundary tags can enforce “apps do not import `apps/api`” when the API exists

### Negative

- Extra hop (HTTPS) versus in-process reads
- Featured article duplication on Portfolio remains until an articles API exists
- Documentation must keep saying “planned” until `apps/api` is implemented
