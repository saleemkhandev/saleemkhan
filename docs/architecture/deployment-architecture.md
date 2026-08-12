# Deployment Architecture

## Current platform

Deployment platform: Vercel.

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

The portfolio should remain at `/`; there is no `/portfolio` route planned.

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
├── apps/projects
└── ...
```

while Vercel may have independent projects for individual applications.

Conceptually:

```text
GitHub repository
        │
        ↓
saleem-platform
   ┌────┼────┐
   ↓    ↓    ↓
Portfolio Blog Projects
   │     │     │
   ↓     ↓     ↓
 Vercel Vercel Vercel
 Project Project Project
```

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

When adding a new application such as Blog:

1. Create `apps/blog`.
2. Develop and test it independently.
3. Deploy it as an independent Vercel project or temporary Vercel URL.
4. Validate its build and runtime behavior.
5. Add the public `/blog` routing/rewrite strategy.
6. Keep the portfolio at `/` unchanged.

This minimizes risk to the existing public site.

## Future evolution

Potential future topology:

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
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               ↓
                       Shared Platform
```

Admin remains:

```text
admin.saleemkhan.dev
```
