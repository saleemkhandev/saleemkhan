# ADR-0003: Repository-Based Markdown Content for Blog

## Status

Accepted

## Context

`apps/blog` is an independent Nx/Angular application in `saleem-platform`. It needs a maintainable source of engineering articles without introducing a CMS, backend, or database prematurely.

This is a personal engineering blog. Git-native authoring (diffable Markdown in the monorepo) fits the workflow better than a hosted CMS for V1.

Blog is configured for Angular static generation (`outputMode: "static"`) and is intended to deploy as static files on Vercel, similar in spirit to Portfolio. Published article pages should be prerenderable at build time for SEO and hosting simplicity.

A future Admin application, API, and database may manage content later. V1 must leave a clear content boundary so presentation (list/detail) does not couple to Markdown or the filesystem, enabling a later swap to an API-backed source without rewriting feature UI.

Shared libraries (`libs/data-access`, `libs/seo`, generic content frameworks) are not justified yet: Blog is the only content consumer.

## Decision

Blog V1 will:

- Store articles as **Markdown** with **YAML frontmatter**.
- Keep articles under **`apps/blog/content/articles/`**, owned by the Blog application.
- Treat Markdown files as the **source of truth**.
- Derive the article **slug from the filename** (not a required frontmatter field).
  - Slug rule: `^[a-z0-9]+(?:-[a-z0-9]+)*$` (lowercase, hyphen-separated ASCII).
- Process content at **build time** via `blog:prepare-content`.
- Generate typed article data modules under `apps/blog/src/app/generated/` (gitignored):
  - `articles.registry.ts`
  - `articles.manifest.ts` (summaries)
  - one generated module per article (including `contentHtml`)
- Expose data through a thin **Blog-local** content boundary (`ArticleRepository`), not `libs/data-access`.
- Keep Markdown, filesystem paths, and parsers **out of presentation components**.
- **Prerender** published article routes for static deployment.
- Use **`PrerenderFallback.None`** for parameterized article routes under static production.
- **Exclude drafts** from production prerender params, sitemap, and RSS.
- Use **Shiki at build time** for syntax highlighting.
- Keep architecture Blog-local; do **not** create shared content libraries for V1.

### V1 frontmatter contract

Required:

- `title` — non-empty string
- `description` — non-empty string (also used as list excerpt)
- `publishedAt` — `YYYY-MM-DD`
- `status` — `draft` | `published`

Optional:

- `tags` — array of lowercase kebab-case strings

Not in V1 frontmatter: `slug`, `id`, `author`, `categories`, `coverImage`, `canonicalUrl`, `updatedAt`, `readingTime`, separate `excerpt`.

## Alternatives Considered

### MDX

Rejected for V1. Angular lacks a first-class MDX story comparable to Next.js. Interactive demos can link to future `playground` / `architecture-lab` apps instead of embedding components in posts.

### JSON/YAML-only content

Rejected. Awkward for long-form prose, lists, and code blocks. Markdown is the natural authoring format for an engineering blog.

### Headless CMS

Rejected for V1. Adds vendor/ops cost and weakens Git-native workflow before there is an editorial team or Admin product.

### Backend + database

Rejected for V1. Premature operational complexity relative to a personal static blog. Remains a documented future evolution behind the same content boundary.

### Runtime Markdown fetching

Rejected. Weakens static generation and SEO; pushes parsing into browser/SSR request paths. Build-time HTML is preferred.

### Shared content / data-access library

Rejected for V1. Only Blog consumes articles today. Extracting `libs/data-access` or a generic content platform would be speculative coupling.

## Consequences

### Positive

- Git-native authoring and review (PRs, diffs, blame).
- Easy local writing without CMS tooling.
- Strong SEO when articles are prerendered to static HTML.
- Fits Angular `outputMode: "static"` and static Vercel deployment.
- Low operational complexity (no CMS, DB, or auth for content).
- Clear migration seam: swap Markdown-backed repository for API-backed later without rewriting list/detail UI.
- Build-time discovery feeds (`/blog/sitemap.xml`, `/blog/rss.xml`) stay derived from the same prepared article set as the repository — no second content source.

### Negative

- A custom build-time content pipeline is required.
- No visual CMS or in-browser draft preview workflow in V1.
- Content changes require a rebuild/deploy to appear in production.
- Slug changes (filename renames) need care; old URLs will 404 unless redirects are added later.
- Presentation and content tooling remain Blog-specific until real cross-app reuse appears.
- Public `/blog` mounting requires an independent Blog Vercel project plus root-path rewrites (see deployment architecture). Root `robots.txt` stays Portfolio-owned.
