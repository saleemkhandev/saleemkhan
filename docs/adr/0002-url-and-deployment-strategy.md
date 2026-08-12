# ADR-0002: Unified Public URLs with Independently Deployable Applications

## Status

Accepted

## Context

The platform contains multiple applications, but it should feel like one personal website.

The portfolio currently lives at:

`https://saleemkhan.dev/`

We need a URL strategy for future applications such as Blog and Projects.

## Decision

Use the root domain for the portfolio and path-based URLs for public content applications.

```text
https://saleemkhan.dev/
https://saleemkhan.dev/blog
https://saleemkhan.dev/projects
https://saleemkhan.dev/playground
https://saleemkhan.dev/architecture
```

Admin uses a separate subdomain:

```text
https://admin.saleemkhan.dev/
```

## Deployment model

Applications may be deployed as independent Vercel projects even though they live in the same Nx monorepo.

The public routing layer can map:

```text
/              → Portfolio
/blog/*        → Blog
/projects/*    → Projects
/playground/*  → Playground
/architecture/* → Architecture Lab
```

## Why path-based public URLs?

The applications represent parts of one personal platform rather than unrelated products.

The root domain therefore remains the primary identity.

`/portfolio` is intentionally not used because the root domain itself represents the portfolio.

## Why a subdomain for Admin?

Admin is an authenticated management application with a different security and operational boundary from the public website.

## Module Federation decision

Do not introduce Module Federation solely to achieve this URL model.

Independent deployment and unified URLs can exist without runtime micro-frontend composition.

Module Federation should be evaluated separately if runtime composition later becomes valuable.

## Consequences

### Positive

- Consistent personal brand
- Simple public navigation
- Independent application deployment remains possible
- Clear security boundary for Admin
- No forced micro-frontend architecture

### Negative

- Cross-application routing/rewrite configuration must be maintained
- Shared runtime assumptions must be kept explicit
- Each application must correctly handle its public base path

## Incremental rollout

New applications should first be deployed independently and validated before being attached to their final public path.
