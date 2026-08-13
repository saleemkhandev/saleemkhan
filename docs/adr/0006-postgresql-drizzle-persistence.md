# ADR-0006: Choose PostgreSQL and Drizzle for API Persistence

## Status

Accepted

## Context

ADR-0004 introduces a planned Developer Platform API. Projects data has no existing source of truth in the repository. Portfolio featured-article metadata is duplicated presentation data; Blog articles remain Markdown (ADR-0003).

The API needs a system of record for API-owned data, starting with Projects. The datastore must be owned exclusively by `apps/api`. Frontends and a future MCP server must not open database connections.

The schema is expected to stay small in V1. Persistence should stay explicit and reviewable. This ADR records the planned stack; PostgreSQL, Drizzle, Docker, and migrations are not created in this milestone.

## Decision

Use **PostgreSQL** as the system of record for API-owned data.

Use **Drizzle** as the TypeScript data-access layer, with committed SQL migrations.

`apps/api` exclusively owns:

- the database connection
- the schema
- migrations
- repositories

There is **no articles table in V1**. Markdown under `apps/blog/content/articles/` remains the article source of truth (ADR-0003).

Initial persistence focus: **Projects**.

Platform metadata in V1 may be static configuration rather than a table.

PostgreSQL is chosen because:

- a relational model fits projects and later platform metadata (unique slugs, status, tags, URLs)
- it is mature
- local development with Compose is straightforward (planned; not added here)
- managed hosting is available on the planned API platform (Railway)
- it is useful backend engineering experience for this repository
- it can serve future Admin writes and MCP reads through the API, not through direct SQL

Drizzle is chosen because:

- it is TypeScript-first
- the schema lives as explicit TypeScript
- it stays SQL-oriented
- migration files are reviewable in pull requests
- runtime complexity is low (no separate query-engine binary)
- a small schema is a good fit
- it integrates cleanly into an Nx app without a generate step on every CI run

Planned local development (future implementation): Compose for PostgreSQL only; `nx serve api` on the host. Planned production: managed PostgreSQL next to the API.

Do not install Drizzle, create a database, or add Compose/Docker files in this documentation milestone.

## Alternatives Considered

### Prisma

A valid alternative. It has a stronger ecosystem and tutorial story, including Nest examples and Prisma Studio. It also introduces generated client machinery and a query engine that V1 does not need for a small Projects schema. Prisma remains acceptable if a later requirement (for example richer client generation) outweighs that cost.

### TypeORM

A valid alternative with strong Nest integration. It leans on decorator/entity abstraction and is less aligned with this repository’s preference for explicit, simple implementation (see Blog’s plain validation functions versus framework-heavy content layers). It is not chosen for V1.

### SQLite

Rejected for the planned production API. Fine for experiments; weaker as the system of record for a hosted platform API and managed backups.

### No database (JSON files in the API)

Rejected. The point of this phase is persistence behind an HTTP boundary. File-backed API data would recreate Blog’s static model without Blog’s authoring advantages.

## Consequences

### Positive

- One clear owner for schema and migrations
- SQL remains visible in review
- Frontends stay ignorant of persistence
- Blog is not forced onto a database

### Negative

- Operating PostgreSQL (local Compose later, managed instance in production) is new operational work
- CI will eventually need a test database when integration tests exist
- Drizzle has fewer Nest tutorials than Prisma; that is an acceptable documentation cost
