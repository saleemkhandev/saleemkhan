# Developer Platform API

Nx application at `apps/api`. Modular NestJS 11 monolith with the Fastify adapter.

This milestone adds the persistence foundation: PostgreSQL, Drizzle, migrations, and database-aware readiness. Projects, Articles, authentication, MCP, and Railway are later milestones.

## Run locally

PostgreSQL is required for the normal API runtime. The API process still runs on the host through Nx; only PostgreSQL runs in Docker.

```bash
docker compose up -d postgres
cp apps/api/.env.example apps/api/.env
pnpm db:migrate
pnpm start:api
```

Defaults: binds `0.0.0.0:3000` (open `http://localhost:3000`).

| Method | Path            | Purpose                                                      |
| ------ | --------------- | ------------------------------------------------------------ |
| GET    | `/v1/health`    | Process is up (does not check PostgreSQL)                    |
| GET    | `/v1/ready`     | Application + PostgreSQL (`SELECT 1`); 503 if the DB is down |
| GET    | `/docs`         | OpenAPI UI                                                   |
| GET    | `/openapi.json` | OpenAPI document                                             |

Copy `.env.example` to `.env` and keep `DATABASE_URL` pointed at local PostgreSQL. Do not commit `.env`.

Local database name: `saleem_platform`.

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saleem_platform
```

## Local PostgreSQL

`compose.yaml` at the repository root provides PostgreSQL 16 only.

```bash
docker compose up -d postgres
docker compose ps
```

The Compose healthcheck uses `pg_isready`. The API does not depend on that healthcheck; readiness is an application-level `SELECT 1`.

Stop PostgreSQL without deleting data:

```bash
docker compose stop postgres
```

Stop the container and keep the volume:

```bash
docker compose down
```

Reset the local database (deletes the Compose volume):

```bash
docker compose down -v
docker compose up -d postgres
pnpm db:migrate
```

## Migrations

Migrations are explicit. The Nest process does **not** migrate on startup.

```bash
pnpm db:generate   # after schema changes
pnpm db:migrate    # apply committed migrations
pnpm db:studio     # optional local inspector
```

Migration files live at `apps/api/drizzle/migrations/` and are version-controlled. There are no domain tables yet; the first committed migration establishes the Drizzle pipeline only.

## Readiness

- `GET /v1/health` — process alive. Never queries PostgreSQL.
- `GET /v1/ready` — `200` when PostgreSQL answers `SELECT 1`; `503` when it does not.

Example ready payloads:

```json
{
  "status": "ok",
  "checks": {
    "application": "ok",
    "database": "ok"
  }
}
```

```json
{
  "status": "not_ready",
  "checks": {
    "application": "ok",
    "database": "error"
  }
}
```

## Tests

Unit tests do not require PostgreSQL. Database integration tests use a separate database:

```text
saleem_platform_test
```

Default test URL (override with `TEST_DATABASE_URL` if needed):

```text
postgresql://postgres:postgres@localhost:5432/saleem_platform_test
```

The test helper creates `saleem_platform_test` when it does not exist. It will not run against `saleem_platform`.

```bash
docker compose up -d postgres
pnpm exec nx test api
```

## Quality

```bash
pnpm exec nx lint api
pnpm exec nx typecheck api
pnpm exec nx test api
pnpm exec nx build api --configuration=production
```

The production build does not connect to PostgreSQL and does not run migrations.
