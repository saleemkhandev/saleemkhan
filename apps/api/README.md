# Developer Platform API

Nx application at `apps/api`. Modular NestJS 11 monolith with the Fastify adapter.

This foundation exposes process health and readiness only. PostgreSQL, Drizzle, Projects, Articles, authentication, Docker, and Railway are later milestones.

## Run locally

```bash
pnpm start:api
```

Defaults: binds `0.0.0.0:3000` (open `http://localhost:3000`).

| Method | Path            | Purpose                 |
| ------ | --------------- | ----------------------- |
| GET    | `/v1/health`    | Process is up           |
| GET    | `/v1/ready`     | Application initialized |
| GET    | `/docs`         | OpenAPI UI              |
| GET    | `/openapi.json` | OpenAPI document        |

Copy `.env.example` to `.env` if you need to override `HOST` or `PORT`. Do not commit `.env`.

## Quality

```bash
pnpm exec nx lint api
pnpm exec nx typecheck api
pnpm exec nx test api
pnpm exec nx build api --configuration=production
```
