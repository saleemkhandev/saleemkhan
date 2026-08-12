# Saleem Platform — Architecture Overview

## Purpose

`saleem-platform` is an Nx/Angular monorepo for a personal engineering platform.

It combines:

- A professional portfolio
- Engineering content
- Project demonstrations
- Interactive engineering experiments
- Architecture demonstrations
- Content administration

The platform is intentionally designed to grow from a simple portfolio into a real, production-quality frontend platform.

## High-level architecture

```text
                         saleemkhan.dev
                               │
                         Routing Layer
                               │
          ┌────────────────────┼────────────────────┐
          ↓                    ↓                    ↓
         `/`                `/blog`             `/projects`
          │                    │                    │
          ↓                    ↓                    ↓
     Portfolio App          Blog App           Projects App
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ↓
                       Shared Platform
                               │
                ┌──────────────┼──────────────┐
                ↓              ↓              ↓
               UI        Data Access      Analytics
```

Admin is a separate application boundary:

```text
admin.saleemkhan.dev
        │
        ↓
    Admin App
        │
        ↓
 Authentication
        │
        ↓
      API
```

## Planned applications

### Portfolio

Primary professional website.

URL:

`https://saleemkhan.dev/`

### Blog

Engineering articles and technical writing.

URL:

`https://saleemkhan.dev/blog`

### Projects

Project showcase.

URL:

`https://saleemkhan.dev/projects`

### Playground

Interactive engineering experiments.

URL:

`https://saleemkhan.dev/playground`

### Architecture Lab

Interactive architecture visualizations and demonstrations.

URL:

`https://saleemkhan.dev/architecture`

### Admin

Authenticated content-management application.

URL:

`https://admin.saleemkhan.dev/`

## Monorepo structure

```text
saleem-platform/
├── apps/
│   ├── portfolio/
│   ├── blog/
│   ├── projects/
│   ├── playground/
│   ├── architecture-lab/
│   └── admin/
│
├── libs/
│   ├── ui/
│   ├── auth/
│   ├── data-access/
│   ├── analytics/
│   ├── feature/
│   └── utils/
│
├── infrastructure/
│   ├── terraform/
│   └── deployment/
│
├── docs/
│   ├── architecture/
│   └── adr/
│
└── tools/
```

This is the intended evolution, not a requirement that every directory exist from day one.

## Dependency model

Preferred layering:

```text
apps
  ↓
feature
  ↓
data-access / ui
  ↓
utils
```

Applications should not directly depend on sibling applications.

Example:

```text
apps/projects
      ↓
libs/feature/projects
      ↓
libs/data-access
      ↓
API
```

and:

```text
apps/blog
      ↓
libs/feature/blog
      ↓
libs/data-access
      ↓
API
```

Both may consume shared platform libraries:

```text
libs/ui
libs/auth
libs/analytics
libs/utils
```

## Backend evolution

The backend is deliberately not introduced prematurely.

Initial content can remain static/local.

When dynamic content becomes necessary:

```text
Application
    ↓
Data-access
    ↓
Backend API
    ↓
Database
```

Admin and authentication should be introduced when there is a real content-management requirement.

## Architectural philosophy

The platform should grow because requirements create architectural problems.

Preferred sequence:

```text
Real requirement
      ↓
Architectural problem
      ↓
Design decision
      ↓
Implementation
      ↓
ADR
```

Do not add technology merely because it is common in enterprise architectures.

## Relationship to the generic monorepo reference

The generic reference architecture emphasizes thin applications, layered libraries, explicit boundaries, shared design-system/platform capabilities, and selective micro-frontends. These principles are used as learning/reference material rather than copied as a literal architecture for `saleem-platform`.
