# Saleem Khan

Personal engineering portfolio and engineering lab.

Public site: [https://saleemkhan.dev](https://saleemkhan.dev)

## Purpose

This repository is the long-term home for:

- a public engineering portfolio
- architecture notes and case studies
- technical experiments
- future playgrounds and labs

## Architecture

- **Monorepo:** Nx + pnpm
- **Primary app:** `apps/portfolio`
- **Layout:** fixed profile panel + scrolling content
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

### Start apps

```bash
pnpm start          # portfolio
pnpm start:blog     # blog
```

### Workspace quality checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

These root scripts validate the whole workspace (Portfolio + Blog).
App-specific builds: `pnpm build:portfolio`, `pnpm build:blog`.

### Development workflow

See [docs/architecture/development-workflow.md](docs/architecture/development-workflow.md)
for the branch → PR → GitHub Actions → merge → Vercel flow.
