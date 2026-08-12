# ADR-0001: Use an Nx Monorepo

## Status

Accepted

## Context

The platform will contain multiple related applications:

- Portfolio
- Blog
- Projects
- Playground
- Architecture Lab
- Admin

These applications share potential platform capabilities such as UI components, authentication, data access, analytics, and utilities.

Keeping these applications in separate repositories would make shared development and coordinated architectural evolution more difficult.

## Decision

Use an Nx monorepo as the primary repository architecture.

Applications live under `apps/`.

Reusable capabilities live under `libs/`.

## Dependency principle

Applications should not directly depend on sibling applications.

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

## Consequences

### Positive

- One repository for related applications
- Shared libraries without publishing separate packages
- Nx dependency graph
- Affected builds and task caching
- Centralized architectural tooling
- Easier cross-application refactoring

### Negative

- Requires explicit dependency boundaries
- Workspace tooling becomes more important
- Poorly governed shared libraries can create coupling

## Rejected alternative

Separate repositories for every application.

This may become appropriate for a future independently owned product, but it is not the current goal.

## Boundary rule

A monorepo does not imply that everything should be shared.

Extract code into `libs/` only when there is genuine reuse or a platform responsibility.
