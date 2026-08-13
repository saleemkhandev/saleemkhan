# Deployment Architecture

## Current vs planned

**Current** frontend hosting: Vercel.

| Application | Host                              | Status                   |
| ----------- | --------------------------------- | ------------------------ |
| Portfolio   | Vercel                            | Deployed                 |
| Blog        | Vercel                            | Deployed                 |
| API         | Railway                           | Planned; not deployed    |
| PostgreSQL  | Managed PostgreSQL (with the API) | Planned; not provisioned |

The API hostname **target** is `https://api.saleemkhan.dev`. That DNS and Railway service do not exist yet.

## Current frontend platform

Deployment platform for Portfolio and Blog: Vercel.

## Public domain

`https://saleemkhan.dev/`

The root domain represents the personal platform and portfolio.

## Public URL model

```text
saleemkhan.dev/
saleemkhan.dev/blog
saleemkhan.dev/blog/<slug>
saleemkhan.dev/projects
saleemkhan.dev/playground
saleemkhan.dev/architecture
```

Planned API host (not a website path):

```text
api.saleemkhan.dev
```

The portfolio should remain at `/`; there is no `/portfolio` route planned. The API is a separate operational boundary (ADR-0004, ADR-0007), analogous to Admin’s subdomain rather than `/blog`-style path mounting.

## Admin

Admin is a separate application boundary:

```text
admin.saleemkhan.dev/
```

## Repository vs deployment architecture

These are intentionally separate concerns.

One Git repository can contain:

```text
saleem-platform/
├── apps/portfolio
├── apps/blog
├── apps/api         # planned
├── apps/projects    # planned
└── ...
```

while each application may deploy to a different platform.

**Current** frontend topology:

```text
GitHub repository
        │
        ↓
saleem-platform
   ┌────┴────┐
   ↓         ↓
Portfolio   Blog
   │         │
   ↓         ↓
 Vercel    Vercel
```

**Planned** topology (API not implemented or deployed yet):

```text
                    GitHub
                       │
                GitHub Actions
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
     Vercel          Vercel        Railway
   Portfolio          Blog           API
        │              │              │
        │              │          PostgreSQL
        │              │
        └──── HTTPS ───┴──────────────┘
                       │
                  API boundary
```

Frontends and a future MCP server talk to the API over HTTPS. They never connect to PostgreSQL.

The public experience can still be unified:

```text
saleemkhan.dev
      │
 Routing layer
      │
 ┌────┼──────────────┐
 ↓    ↓              ↓
/   /blog        /projects
```

## Module Federation

Do not introduce Module Federation solely to achieve URL routing.

A unified domain and independently deployed applications do not automatically require micro-frontends.

Evaluate Module Federation when there is a genuine need for:

- Runtime composition
- Independently deployed runtime modules
- Organizational/deployment boundaries that justify the operational complexity

## Current application deployments

### Portfolio (root / default project)

Repository config: root `vercel.json`

| Setting          | Value                                                     |
| ---------------- | --------------------------------------------------------- |
| Build command    | `pnpm exec nx build portfolio --configuration=production` |
| Output directory | `dist/apps/portfolio/browser`                             |
| Output mode      | Static (`outputMode: "static"`)                           |
| Node runtime     | Not required for production                               |

Owns:

- `/`
- Root `robots.txt`
- Root `sitemap.xml` (Portfolio URLs only)

SPA-style rewrite remains for Portfolio client routes:

```text
/((?!.*\\.).*) → /index.html
```

### Blog (independent Vercel project)

Repository config: `apps/blog/vercel.json`

| Setting               | Value                                                |
| --------------------- | ---------------------------------------------------- |
| Build command         | `pnpm exec nx build blog --configuration=production` |
| Output directory      | `dist/apps/blog/browser`                             |
| Output mode           | Static (`outputMode: "static"`)                      |
| Production `baseHref` | `/blog/`                                             |
| Node runtime          | Not required for production                          |

Internal Angular routes:

```text
/           → Article list
/:slug      → Published article (prerendered)
```

Public URLs after mount:

```text
/blog/           → Article list
/blog/<slug>     → Published article
/blog/sitemap.xml
/blog/rss.xml
```

Blog build pipeline:

```text
prepare-content → Angular static build → dist/apps/blog/browser
```

`prepare-content` runs automatically via Nx `dependsOn` before `blog:build`.

Published article HTML is prerendered at build time. Drafts and unknown slugs are not prerendered (`PrerenderFallback.None`). Blog `vercel.json` intentionally has **no** catch-all SPA rewrite so missing article paths can return a real CDN 404.

### Mounting Blog under `/blog` (manual Vercel step)

Root Portfolio project must rewrite `/blog` traffic to the Blog Vercel project **before** the Portfolio SPA catch-all.

Example root rewrite pair (replace the destination host with the real Blog production deployment URL):

```json
{
  "source": "/blog",
  "destination": "https://<blog-vercel-deployment>/"
},
{
  "source": "/blog/:path*",
  "destination": "https://<blog-vercel-deployment>/:path*"
}
```

Manual steps required in the Vercel dashboard / project settings:

1. Create a second Vercel project pointing at this monorepo.
2. Set Root Directory / project config to use `apps/blog/vercel.json` (or equivalent build/output overrides).
3. Confirm Blog production builds with `baseHref` `/blog/`.
4. Add the `/blog` rewrites above to the **root** Portfolio project, placed **above** the Portfolio SPA rewrite.
5. Attach `saleemkhan.dev` to the Portfolio (default) project as today.
6. Verify:
   - `https://saleemkhan.dev/` → Portfolio
   - `https://saleemkhan.dev/blog/` → Blog list
   - `https://saleemkhan.dev/blog/<published-slug>` → Article
   - draft/unknown article paths → real 404

Until step 4 is completed in the deployed environment, local Blog verification is authoritative for content/SEO/static output; production path mounting remains a Vercel wiring task.

### robots.txt ownership

Root `robots.txt` is owned by Portfolio (domain root).

It references:

```text
Sitemap: https://saleemkhan.dev/sitemap.xml
Sitemap: https://saleemkhan.dev/blog/sitemap.xml
```

Blog must **not** publish a competing root `robots.txt`. Blog discovery files live under `/blog/` (`sitemap.xml`, `rss.xml`) and are generated at Blog build time from published articles only.

## Incremental deployment strategy

When adding a new **frontend** application such as Blog or Projects:

1. Create the Nx application.
2. Develop and test it independently.
3. Deploy it as an independent Vercel project or temporary Vercel URL.
4. Validate its build and runtime behavior.
5. Add the public path routing/rewrite strategy.
6. Keep the portfolio at `/` unchanged.

When adding the **API** (future implementation):

1. Create `apps/api` in the monorepo.
2. Develop against local Postgres (planned Compose) and Nx serve.
3. Deploy independently to Railway (or a Railway-preview URL).
4. Validate health, readiness, and the V1 read APIs.
5. Attach `api.saleemkhan.dev`.
6. Do not put the API behind the Portfolio SPA rewrite on Vercel.

This minimizes risk to the existing public site.

## Planned API hosting (not deployed)

Target: Railway for the NestJS modular monolith, plus managed PostgreSQL on the same platform.

Planned hostname: `https://api.saleemkhan.dev`.

The API should **not** initially deploy as Vercel Functions:

- a long-lived Node backend is a better fit for a Nest modular monolith
- PostgreSQL connection management is simpler on a persistent process
- migrations are an explicit release step, not a per-request side effect
- the runtime mental model stays one API process
- the backend learning objective is a real service, not a serverless adapter around Nest

Vercel remains the right host for static Portfolio and Blog output.

Do not add Railway configuration, Docker files, or `apps/api` in this documentation milestone.

## Future evolution

Public website topology (frontends):

```text
                         saleemkhan.dev
                               │
                         Routing Layer
                               │
        ┌──────────────────────┼──────────────────────┐
        ↓                      ↓                      ↓
       `/`                  `/blog/*`             `/projects/*`
        │                      │                      │
        ↓                      ↓                      ↓
   Portfolio                 Blog                  Projects
      App                     App                    App
```

API and Admin remain separate hosts:

```text
api.saleemkhan.dev      → Developer Platform API (planned)
admin.saleemkhan.dev    → Admin (later)
```

Future MCP:

```text
AI client → MCP server → HTTPS → API → PostgreSQL
```

MCP must not access PostgreSQL directly.
