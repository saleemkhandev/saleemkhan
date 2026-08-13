# Saleem Khan

Personal engineering portfolio and engineering lab.

Public site: [https://saleemkhan.dev](https://saleemkhan.dev)

## Purpose

This repository is the long-term home for:

- a public engineering portfolio
- an engineering blog
- architecture notes and case studies
- a Developer Platform API foundation
- technical experiments
- future playgrounds and labs

## Architecture

- **Monorepo:** Nx + pnpm
- **Current apps:** `apps/portfolio`, `apps/blog`, `apps/api`
- **Layout:** fixed profile panel + scrolling content
- **Angular:** latest stable Angular 22 with standalone components, Signals, and modern control flow
- **Rendering:** static prerender (SSG) via Angular SSR tooling
- **Styling:** SCSS design tokens, no premature design system package
- **State:** local component state and Signals only (intro role rotator)
- **Frontend hosting:** Vercel → `saleemkhan.dev`
- **API:** `apps/api` at `http://localhost:3000` (health/ready + PostgreSQL persistence foundation; Railway later)

See [docs/architecture.md](docs/architecture.md) and [docs/adr/](docs/adr/) for decision records.

## Repository structure

```text
saleemkhan/
├── apps/
│   ├── portfolio/          # Public website
│   ├── blog/               # Engineering blog at /blog
│   └── api/                # Developer Platform API
├── compose.yaml            # Local PostgreSQL only
├── docs/
│   ├── architecture.md
│   ├── architecture/
│   └── adr/
├── vercel.json             # Vercel deployment config
├── package.json
├── pnpm-workspace.yaml
├── nx.json
└── tsconfig.base.json
```

See [apps/api/README.md](apps/api/README.md) for local API and PostgreSQL usage. Projects and Railway are later milestones.

Future applications and libraries will be added only when there is a concrete need.

## Technology choices

| Area             | Choice                | Notes                                                             |
| ---------------- | --------------------- | ----------------------------------------------------------------- |
| Framework        | Angular 22            | Deliberate demonstration of primary expertise                     |
| Workspace        | Nx 23                 | Prepared for multi-app growth without creating empty apps now     |
| Package manager  | pnpm                  | Efficient installs and workspace-friendly                         |
| Language         | TypeScript (strict)   | No `any` without justification                                    |
| Rendering        | Static prerender      | SEO + simple Vercel deploy                                        |
| State            | Signals / local state | No NgRx yet                                                       |
| API              | NestJS 11 + Fastify   | Modular monolith at `apps/api`; health/ready + Drizzle/PostgreSQL |
| Persistence      | PostgreSQL + Drizzle  | Owned exclusively by `apps/api`; local Compose; Railway later     |
| Frontend hosting | Vercel                | Static Portfolio and Blog                                         |
| API hosting      | Railway (future)      | Planned; not configured in this milestone                         |

## Local development

### Requirements

- Node.js 22+
- pnpm 10+
- Docker (local PostgreSQL via Compose)

### Install

```bash
pnpm install
```

### Start apps

```bash
pnpm start          # portfolio
pnpm start:blog     # blog
pnpm start:api      # API at http://localhost:3000 (requires local PostgreSQL)
```

Local API database:

```bash
docker compose up -d postgres
pnpm db:migrate
pnpm start:api
```

### Workspace quality checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

These root scripts validate the whole workspace (Portfolio, Blog, and API).
App-specific builds: `pnpm build:portfolio`, `pnpm build:blog`, `pnpm build:api`.

### Development workflow

See [docs/architecture/development-workflow.md](docs/architecture/development-workflow.md)
for the branch → PR → GitHub Actions → merge → Vercel flow.
