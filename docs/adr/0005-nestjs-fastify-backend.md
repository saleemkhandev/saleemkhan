# ADR-0005: Choose NestJS with Fastify for the Developer Platform API

## Status

Accepted

## Context

ADR-0004 introduces a planned Developer Platform API at `apps/api` as a modular monolith. The implementation stack is not installed yet. This ADR records the framework choice so later work does not reopen the decision casually.

The workspace already depends on Express because Angular SSR adapters use it (`apps/portfolio/src/server.ts`, `apps/blog/src/server.ts`). Production frontend output is static, so that Express server is not a running product API.

The API needs:

- TypeScript
- clear module boundaries
- testability
- request validation
- OpenAPI
- a production HTTP runtime that is not the Angular SSR adapter

The workspace TypeScript toolchain is currently 6.x. Nest as a runtime framework is compatible with that line. The API should be built and served through Nx (`tsc` or esbuild), not a second Nest CLI toolchain as the source of truth.

## Decision

When `apps/api` is implemented, use:

- **NestJS 11** as the application framework
- **Fastify** as the HTTP adapter (`@nestjs/platform-fastify`)

Planned supporting libraries (not installed in this milestone): Zod for request validation, `@nestjs/swagger` for OpenAPI.

NestJS is chosen because:

- modules map cleanly onto a modular monolith (Health, Platform, Projects)
- dependency injection is first-class and familiar from Angular
- it is TypeScript-first
- `TestingModule` supports isolated module tests
- OpenAPI has a first-class Nest integration
- it is an appropriate backend learning objective for this platform without inventing a framework

Fastify is chosen because:

- it avoids treating Angular’s existing Express SSR dependency as the API runtime
- it avoids coupling the backend to Angular SSR entrypoints
- it is a strong HTTP runtime with a good logging and schema ecosystem
- Nest provides a first-class Fastify adapter
- it avoids mixing Express 4 (Angular SSR) with Express 5 (Nest’s default adapter) in the root workspace

Do not install NestJS, Fastify, or related packages in this documentation milestone.

## Alternatives Considered

### Express (including Nest’s default Express adapter)

Express is capable of serving this API. The decision not to use it is architectural, not a claim that Express is inadequate.

The existing Express dependency belongs to Angular SSR scaffolding. Frontend apps use static output in production. That Express server is not an existing Developer Platform backend. NestJS 11’s default HTTP stack also targets Express 5, which would collide with the workspace’s Express 4 SSR dependency.

Hand-rolled Express modules would require inventing the module, DI, testing, and OpenAPI structure Nest already provides.

### Fastify without Nest

Possible. Fastify is a strong runtime. Without Nest, the repository would still need to establish module boundaries, dependency injection, testing harnesses, and API documentation conventions by hand. Nest already provides those for a modular monolith. The extra framework is justified by that structure, not by runtime fashion.

### Other TypeScript frameworks (for example Hono or Elysia)

Not chosen. They can be excellent, but they are a weaker fit for demonstrating a modular Nest-style backend in this portfolio and have less conventional Nx/OpenAPI/testing documentation for this use case.

## Consequences

### Positive

- Module boundaries, DI, testing, and OpenAPI have a conventional home
- The API runtime is visibly separate from Angular SSR
- Angular-familiar concepts (modules, injectable services) transfer to the backend

### Negative

- Nest adds framework complexity compared with a tiny Fastify file
- Fastify adapter types and Nest + Fastify plugin wiring must be learned
- Nx must compile the API with Node-oriented TypeScript settings (`emitDecoratorMetadata` on; not Angular’s `bundler`/`preserve` module settings)
