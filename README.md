# Saleem Khan

Personal engineering portfolio and engineering lab.

Public site: [https://saleemkhan.dev](https://saleemkhan.dev)

## Purpose

This repository is the long-term home for:

- a public engineering portfolio
- architecture notes and case studies
- technical experiments
- future playgrounds and labs

It is intentionally built with Angular to reflect deep frontend engineering focus, especially around Angular, TypeScript, and application architecture.

Career direction represented here:

`Senior Software Engineer → Staff Engineer → Frontend Architect / Software Architect`

## Architecture

- **Monorepo:** Nx + pnpm
- **Primary app:** `apps/portfolio`
- **Layout:** fixed profile panel + scrolling content (Deebo-inspired)
- **Angular:** latest stable Angular 22 with standalone components, Signals, and modern control flow
- **Rendering:** static prerender (SSG) via Angular SSR tooling
- **Styling:** SCSS design tokens, no premature design system package
- **State:** local component state and Signals only (intro role rotator)
- **Hosting target:** Vercel → `saleemkhan.dev`

See [docs/architecture.md](docs/architecture.md) for decision records.

## Repository structure

```text
saleemkhan/
├── apps/
│   └── portfolio/          # Public website
├── docs/
│   └── architecture.md     # Architecture decisions
├── vercel.json             # Vercel deployment config
├── package.json
├── pnpm-workspace.yaml
├── nx.json
└── tsconfig.base.json
```

Future applications and libraries will be added only when there is a concrete need.

## Technology choices

| Area            | Choice                | Notes                                                         |
| --------------- | --------------------- | ------------------------------------------------------------- |
| Framework       | Angular 22            | Deliberate demonstration of primary expertise                 |
| Workspace       | Nx 23                 | Prepared for multi-app growth without creating empty apps now |
| Package manager | pnpm                  | Efficient installs and workspace-friendly                     |
| Language        | TypeScript (strict)   | No `any` without justification                                |
| Rendering       | Static prerender      | SEO + simple Vercel deploy                                    |
| State           | Signals / local state | No NgRx yet                                                   |
| CI hosting      | Vercel                | Free tier friendly for static output                          |

## Local development

### Requirements

- Node.js 22+
- pnpm 10+

### Install

```bash
pnpm install
```

### Start the portfolio app

```bash
pnpm start
```

or:

```bash
pnpm exec nx serve portfolio
```

### Production build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

### Typecheck

```bash
pnpm typecheck
```

### Format

```bash
pnpm format
```

## Deployment direction

Intended flow:

```text
Developer → Git → GitHub → Vercel → saleemkhan.dev
```

Vercel should build with:

```bash
pnpm exec nx build portfolio --configuration=production
```

and publish:

```text
dist/apps/portfolio/browser
```

DNS for `saleemkhan.dev` is managed at the registrar (Spaceship) and should point to Vercel after the project is connected.

## Roadmap

Near-term:

- deploy the landing page to Vercel
- attach `saleemkhan.dev`
- add About / Experience / Projects content with real substance

Later, only when justified:

- blog
- architecture case studies
- playgrounds
- shared UI / design-system libraries
- richer CI, analytics, and observability
