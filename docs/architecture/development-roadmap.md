# Development Roadmap

## Guiding principle

Do not implement the entire target architecture at once.

Grow the platform in stages, with each stage solving a real problem.

## Stage 1 — Current foundation (delivered)

```text
apps/
├── portfolio/
└── blog/

docs/
├── architecture/
└── adr/

.github/workflows/ci.yml
```

Focus:

- Stable Portfolio at `/`
- Blog production pipeline at `/blog` (Markdown → prepare-content → static prerender)
- Nx workspace with lint / typecheck / test / build targets
- GitHub Actions quality gate on PRs and `main`
- Architecture docs and ADRs as the decision record

## Stage 2 — Shared platform foundation

Introduce only the first genuinely shared libraries when real reuse appears.

Likely:

```text
libs/
├── ui/
└── utils/
```

Also establish meaningful Nx dependency constraints once tags have real consumers.

## Stage 3 — Next content applications

Add:

```text
apps/
├── portfolio/   # exists
├── blog/        # exists
└── projects/    # next
```

Introduce shared libraries based on real reuse.

Potentially:

```text
libs/
├── ui/
├── data-access/
├── analytics/
└── utils/
```

## Stage 4 — Content platform

Introduce dynamic content only when required:

```text
Apps
  ↓
Data-access
  ↓
Backend API
  ↓
Database
```

Add Admin when content needs to be managed through a UI.

## Stage 5 — Authentication

Introduce:

```text
libs/auth/
```

when Admin or other authenticated applications require it.

## Stage 6 — Platform and cloud

Introduce:

```text
infrastructure/
├── terraform/
└── deployment/
```

when cloud infrastructure becomes a meaningful requirement or learning objective.

## Stage 7 — Advanced frontend architecture

Potentially add:

- Feature flags
- Observability
- Advanced deployment strategies
- Module Federation
- Runtime composition

Only when the problem justifies them.

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
