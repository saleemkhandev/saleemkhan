---
title: 'From Markdown to Production: How My Engineering Blog Works'
description: 'How this Angular blog turns Git-owned Markdown into validated, highlighted, prerendered pages — and how ArticleRepository leaves a path to a dynamic content platform without rewriting the UI.'
publishedAt: '2026-08-13'
status: 'published'
tags:
  - angular
  - architecture
  - markdown
  - static-site-generation
  - content-architecture
---

# From Markdown to Production: How My Engineering Blog Works

What actually happens after I create a Markdown file?

```text
apps/blog/content/articles/from-markdown-to-production.md
```

Eventually that file is this URL:

```text
https://saleemkhan.dev/blog/from-markdown-to-production
```

There is no runtime Markdown fetch in this architecture. There is no database. There is no CMS. There is no Blog API. The browser never sees the `.md` file.

The content is transformed during the build.

That is the whole design. This article is a case study of that pipeline — the content architecture that sits between the [monorepo](building-an-angular-monorepo), the [frontend boundaries](frontend-architecture), and the [pull-request workflow](from-pull-request-to-production).

```text
Monorepo
    ↓
Frontend architecture
    ↓
Content architecture   ← this article
    ↓
Engineering / CI workflow
```

## The Blog architecture at a glance

```text
Markdown
    |
    v
prepare-content
    |
    +-- slug / frontmatter validation
    +-- Marked (GFM, raw HTML stripped)
    +-- Shiki (github-dark)
    |
    v
Generated article data
    |
    +-- articles.manifest.ts
    +-- articles.registry.ts
    +-- articles/<slug>.data.ts
    +-- sitemap.xml / rss.xml
    |
    v
ArticleRepository
    |
    +----------------+
    |                |
    v                v
Article list    Article detail
                     |
                     v
            Angular prerender
                     |
                     v
               Static HTML
                     |
                     v
                  Vercel
```

Every name in that diagram exists in this repository. `prepare-content` is an Nx target. `ArticleRepository` is a Blog-local abstract class. The generated files are build artifacts. Vercel hosts the static output of `blog:build` with `outputMode: "static"`.

## Why Markdown is the source of truth

Articles live under `apps/blog/content/articles/` because Blog owns its content. That is ADR-0003: repository-based Markdown, not a CMS, not `libs/data-access`, not a shared content framework.

I intentionally chose Markdown for this Blog.

Git-native authoring is the point. I write in the same repository I already review. Version history is `git log`. A change is a diff. A draft is a branch. Publishing is a pull request. There is no second system to keep in sync with Git.

That also means I do not need a database, a CMS, or an editorial UI to ship an engineering article. Markdown is the natural format for the content I actually write: headings, lists, tables, blockquotes, and code. It is an excellent fit for static generation. The operational complexity stays close to zero.

The trade-off is honest. Publishing currently requires:

```text
Markdown change
    → Git commit / pull request
    → CI quality gate
    → Blog production build
    → deployment
```

I accepted that on purpose.

This Blog is single-author, relatively low publishing frequency, engineering-focused, read-heavy, and SEO-sensitive. Git already is the CMS. I am not claiming Markdown is universally better than a hosted editor. I am claiming it is the right source of truth for _this_ product, at _this_ stage.

## Anatomy of an article

The filename is the slug. This file is `from-markdown-to-production.md`, so the public path is `/blog/from-markdown-to-production`. Frontmatter does not contain a `slug` field. If I rename the file, the URL changes. Old URLs 404 unless I add redirects later.

Slug rule, from `apps/blog/scripts/lib/content-validation.mjs`:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Lowercase, hyphen-separated ASCII. `Bad_Slug.md` fails the build. Duplicate slugs fail the build.

A real frontmatter block from this repository looks like this:

```yaml
---
title: 'Building an Angular Monorepo'
description: 'Why this site became an Nx workspace when Blog appeared — and how two Angular apps stay independently deployable under one domain.'
publishedAt: '2026-08-01'
status: 'published'
tags:
  - angular
  - nx
  - monorepo
---
```

Required fields:

| Field         | Rule                                          |
| ------------- | --------------------------------------------- |
| `title`       | Non-empty string                              |
| `description` | Non-empty string — also the list-page excerpt |
| `publishedAt` | Real calendar date, `YYYY-MM-DD`              |
| `status`      | `draft` or `published`                        |

Optional:

| Field  | Rule                                  |
| ------ | ------------------------------------- |
| `tags` | Array of lowercase kebab-case strings |

`2026-02-30` is not a valid `publishedAt`. Tags like `StaticSSG` fail. An empty Markdown body fails. Invalid YAML fails.

What is _not_ in V1 frontmatter: `slug`, `id`, `author`, `categories`, `coverImage`, `canonicalUrl`, `updatedAt`, `readingTime`, or a separate `excerpt`. Description does that job. Author is a site constant, not per-article metadata.

`status: published` is what makes an article public. `status: draft` keeps the file in Git and in the generated modules, but out of the public repository results. I will come back to that.

Discovery is flat. `prepare-content` reads `*.md` files directly in `content/articles/`. Subdirectories are not articles.

## What happens during `prepare-content`?

This is the interesting part. The pipeline is `apps/blog/scripts/prepare-content.mjs`. Presentation code is not allowed to import it.

It runs as the Nx target `blog:prepare-content`:

```bash
pnpm nx run blog:prepare-content
```

I rarely run that by hand. `blog:build`, `blog:serve`, and `blog:typecheck` all `dependsOn` `prepare-content`, so a production build cannot skip the pipeline.

The libraries are Node build tools, listed as `devDependencies`:

- `gray-matter` — YAML frontmatter
- `marked` — Markdown to HTML, GFM enabled, `breaks: false`
- `shiki` — syntax highlighting at build time

They do not ship to the browser as parsers. The browser receives HTML strings.

Step by step:

```text
Markdown file
    |
    v
Discover *.md in content/articles/
    |
    v
Validate filename / slug
    |
    v
Parse frontmatter (gray-matter)
    |
    v
Validate metadata
    |
    v
Reject empty body
    |
    v
Render Markdown (Marked)
    |
    v
Highlight fenced code (Shiki)
    |
    v
PreparedArticle[]
    |
    +----> articles.manifest.ts
    +----> articles/<slug>.data.ts
    +----> articles.registry.ts
    +----> generated/seo/sitemap.xml
    +----> generated/seo/rss.xml
```

Discovery sorts filenames, then validates each slug before parsing. After all articles are prepared, they are sorted newest `publishedAt` first, slug ascending on ties — the same order the public list uses.

Marked is configured with a custom renderer. Two details matter:

1. **Raw HTML is stripped.** The `html()` renderer returns an empty string. Git-owned Markdown is the trust boundary; author-supplied markup tags never reach Angular.
2. **Fenced code goes through Shiki**, theme `github-dark`. Loaded languages are `typescript`, `javascript`, `json`, `html`, `css`, `scss`, `bash`, `yaml`, `markdown`, and `text`. Aliases map `ts` → `typescript`, `js` → `javascript`, `sh`/`shell` → `bash`, `yml` → `yaml`, `md` → `markdown`. Anything else falls back to `text`.

There is no Mermaid renderer. Diagrams in this Blog are fenced `text` blocks, same as the other articles.

The write step wipes `apps/blog/src/app/generated/` and recreates it. Sitemap and RSS are derived from the **published** subset of the same `PreparedArticle[]`. Angular copies those two XML files into the static browser output as assets. There is no second content source for discovery feeds.

What does **not** go to the browser:

- the original Markdown
- `gray-matter`
- `marked`
- the Shiki highlighter runtime
- filesystem paths
- `content-validation.mjs`

What **does** go to the browser: typed article objects, including `contentHtml`, via generated TypeScript modules that `GeneratedArticleRepository` imports.

## Why Markdown is processed at build time

I deliberately moved content processing out of runtime.

A runtime approach would look like this:

```text
Browser
    |
    v
Fetch Markdown
    |
    v
Parse Markdown
    |
    v
Highlight code
    |
    v
Render article
```

That puts a Markdown parser and a syntax highlighter on the request path — in the browser, or on a Node server I would then have to operate. It also fights static generation. ADR-0003 rejected runtime Markdown fetching for that reason.

The current approach:

```text
Build
    |
    +-- Validate
    +-- Parse
    +-- Highlight
    +-- Generate
    |
    v
Static output
    |
    v
Browser
```

The benefits I actually care about:

- Less work on the request path. The article is already HTML.
- No Markdown parser in the browser.
- No Shiki runtime in the browser. Highlighting is inline styles in the generated HTML, plus a small amount of Blog CSS for `.shiki`.
- Predictable output. Invalid frontmatter fails the build, not a page view.
- SEO-friendly prerendered documents.
- Static hosting. Production does not need a Node server. `outputMode` is `"static"`.
- A simple deployment model: Vercel publishes `dist/apps/blog/browser`.

I am not going to invent a performance number. The architectural claim is narrower: for a read-heavy, infrequently published engineering blog, build-time work is the right place to spend complexity.

## Generated article data

`apps/blog/src/app/generated/` is a build artifact. It is gitignored. The source of truth remains `apps/blog/content/articles/`.

After `prepare-content`, that tree looks like this:

```text
apps/blog/src/app/generated/
├── articles.manifest.ts
├── articles.registry.ts
├── articles/
│   ├── building-an-angular-monorepo.data.ts
│   ├── frontend-architecture.data.ts
│   ├── from-pull-request-to-production.data.ts
│   └── ...
└── seo/
    ├── sitemap.xml
    └── rss.xml
```

`articles.manifest.ts` exports `ARTICLE_MANIFEST`: summaries only — slug, title, description, publishedAt, status, tags. The list page should not need article bodies.

Each `articles/<slug>.data.ts` exports a full `Article`, including `contentHtml`.

`articles.registry.ts` imports every per-article module into `ARTICLES_BY_SLUG`. The registry comment is explicit: prefer the manifest for list/discovery so list UI is not typed against article bodies. The bundler may still share chunks.

These files say `AUTO-GENERATED FILE. DO NOT EDIT.` Editing them would be overwritten on the next prepare, and they are not in Git anyway. If generated modules are missing, `blog:typecheck` fails, because it depends on `prepare-content`.

Drafts are generated too. `nx-monorepo-architecture.md` is `status: draft` in this repo. It still gets a `.data.ts` module and a registry entry. Public filtering happens later, in the repository.

## ArticleRepository

The Angular app does not read Markdown. It talks to `ArticleRepository`. I sketched this boundary in [Frontend Architecture for a Personal Platform](frontend-architecture); this article is the content-side walkthrough.

```ts
export abstract class ArticleRepository {
  abstract getPublished(): readonly ArticleSummary[];
  abstract getBySlug(slug: string): Article | null;
}
```

`getPublished()` returns published summaries only, newest first. `getBySlug()` returns a published article, or `null` when the slug is missing or the article is a draft.

The V1 implementation is `GeneratedArticleRepository`. It reads `ARTICLE_MANIFEST` and `ARTICLES_BY_SLUG`, then runs two pure helpers — `toPublishedSummaries` and `resolvePublishedArticle` — so the filtering is unit-tested without an Angular test harness.

Wiring is ordinary DI in `app.config.ts`:

```ts
{
  provide: ArticleRepository,
  useClass: GeneratedArticleRepository,
}
```

List and detail inject `ArticleRepository`. They do not know about:

- `apps/blog/content/articles/`
- `.md` files
- YAML frontmatter
- `gray-matter`
- Marked
- Shiki
- `prepare-content.mjs`

The article model they do know is small:

```ts
export interface ArticleSummary {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly publishedAt: string;
  readonly status: ArticleStatus;
  readonly tags: readonly string[];
}

export interface Article extends ArticleSummary {
  readonly contentHtml: string;
}
```

`contentHtml` is trusted because of the pipeline, not because Angular thinks all HTML is safe. The detail page uses `DomSanitizer.bypassSecurityTrustHtml` only because default sanitization would strip Shiki’s inline styles. That trust boundary is documented on the component: Git-owned Markdown → Marked (raw HTML stripped) → Shiki → generated modules → `[innerHTML]`. Future CMS HTML would need a different strategy.

## Why have an ArticleRepository?

This is not an enterprise content platform. The abstraction is two methods.

I added it because I do not want list and detail to import generated files directly. The repository is the seam.

Today:

```text
Markdown
   |
   v
prepare-content
   |
   v
GeneratedArticleRepository
   |
   v
Blog UI
```

A plausible future:

```text
Admin
   |
   v
Content API
   |
   v
Database
   |
   v
ApiArticleRepository
   |
   v
Blog UI
```

The UI should not care whether the article originated as a Markdown file or as a row in a database. That is the main future value of the boundary. It is Blog-local. It is not `libs/data-access`. Extracting a shared library still waits for a second consumer.

## What happens when someone opens an article?

Take a real URL:

```text
https://saleemkhan.dev/blog/building-an-angular-monorepo
```

The browser does **not** download `building-an-angular-monorepo.md`. It does not parse Markdown. It does not run Shiki. It does not query a Blog database.

```text
Build time
    |
    v
Article processed by prepare-content
    |
    v
Angular prerenders /:slug
    |
    v
Static HTML in dist/apps/blog/browser
    |
    v
Vercel hosts that output
    |
    v
Root project rewrites /blog/* to the Blog deployment
    |
    v
Browser requests the URL
    |
    v
Pre-generated page
```

What is already in that HTML:

- The app shell — header, footer, article layout
- The title, description, date, and tags from the Angular template
- The article body as HTML, including Shiki-highlighted code
- Document metadata written during prerender by `BlogSeo`: title, description, canonical URL, Open Graph, Twitter `summary` card, `BlogPosting` JSON-LD

The client then hydrates (`provideClientHydration`). Hydration is not how the article is fetched. The article was already in the document.

How `/blog` appears on `saleemkhan.dev` is a deployment concern, not a Blog route. Blog’s Angular routes are still `/` and `/:slug`. Production `baseHref` is `/blog/`. The root `vercel.json` rewrites `/blog` and `/blog/:path*` to the independent Blog Vercel project. I covered that split in [Building an Angular Monorepo](building-an-angular-monorepo). Here the important part is: the file that lands on the CDN is prerendered HTML, not a Markdown payload.

## How prerendering works

`apps/blog/src/app/app.routes.server.ts` is the static-generation map:

```ts
export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: ':slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      const articles = inject(ArticleRepository);
      return articles.getPublished().map((article) => ({ slug: article.slug }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
```

The list route is always prerendered. Article routes are prerendered from published slugs only:

```text
Published articles
       |
       v
ArticleRepository.getPublished()
       |
       v
getPrerenderParams()
       |
       v
Angular prerender
       |
       +--> /building-an-angular-monorepo
       +--> /frontend-architecture
       +--> /from-pull-request-to-production
       +--> /from-markdown-to-production
```

Drafts never enter `getPrerenderParams()`, because `getPublished()` already excluded them. `PrerenderFallback.None` means Angular will not generate HTML for an unknown slug at request time. There is no “render this slug on the fly if someone asks.”

The client route table matches that policy. `/:slug` has `publishedArticleCanMatch`, which is `getBySlug(slug) !== null`. Drafts and unknown slugs do not match the detail page. They fall through to `**`, the not-found component.

What a reader actually gets for a bad URL depends on how they arrive:

- **Direct request** to `/blog/not-a-real-slug` — Blog’s `vercel.json` has no catch-all SPA rewrite, and `serve-static` is `spa: false`. There is no prerendered file, so this can be a real CDN 404.
- **In-app navigation** to an unknown slug — Angular renders `NotFoundPage`, which sets `noindex, nofollow` and clears the canonical URL.

That is intentional. Missing articles should not silently become `index.html`.

## Draft articles

`nx-monorepo-architecture.md` is a real draft in this repository. Its lifecycle is:

```text
status: draft
      |
      v
validated like any other article
      |
      v
generated into .data.ts + registry
      |
      v
excluded from getPublished() / getBySlug()
      |
      +----> not prerendered
      +----> not in sitemap.xml
      +----> not in rss.xml
      |
      v
production URL → 404
```

Drafts are a frontmatter concern, not an Admin product. There is no preview URL, no authenticated draft route, and no “view unpublished” mode.

Two limitations follow from that honesty:

1. The Markdown is in Git. A public repository does not hide drafts; it only hides them from the production site.
2. The generated registry still imports draft modules. They are not public pages, but V1 does not treat the client bundle as a draft firewall.

If I needed private drafts, Git-owned Markdown would already be the wrong tool.

## SEO, sitemap, and RSS

The article is the source of metadata. The build derives several public outputs from the same prepared set.

`BlogSeo.applyArticlePage()` uses the article summary:

- `<title>` — `{title} | Saleem Khan`
- `meta name="description"` — the frontmatter description
- canonical URL — `https://saleemkhan.dev/blog/{slug}`
- Open Graph — `og:type=article`, title, description, url, `article:published_time`, `article:tag`
- Twitter — `summary` card (no cover images in V1)
- JSON-LD — `BlogPosting` with headline, description, `datePublished`, author/publisher `Person`, and `mainEntityOfPage`

Because this runs during prerender, those tags are in the static HTML. Crawlers do not have to execute the content pipeline.

The same published set produces:

- `/blog/sitemap.xml` — Blog index plus each published article, `lastmod` from `publishedAt`
- `/blog/rss.xml` — RSS 2.0 channel, item per published article, description from frontmatter

Angular copies both files from `generated/seo/` into the browser output. `index.html` already advertises the RSS feed via `rel="alternate"`. Portfolio-owned `robots.txt` points at both `https://saleemkhan.dev/sitemap.xml` and `https://saleemkhan.dev/blog/sitemap.xml`. Blog does not publish a competing root `robots.txt`.

One Markdown file, several derived surfaces. That is the advantage of treating content as build input.

## How this fits into the PR workflow

I am not going to retell the CI/CD story. [From Pull Request to Production](from-pull-request-to-production) already covers GitHub Actions, Nx affected, Vercel previews, and why deploy stays out of CI.

For Blog content, that workflow is the publish button:

```text
Article Markdown change
        |
        v
Pull Request
        |
        v
CI Quality Gate
        |
        v
Blog production build
        |
        v
prepare-content
        |
        v
prerender
        |
        v
Vercel deployment
```

A Markdown change under `apps/blog/content/articles/` marks Blog affected. Blog’s production build depends on `prepare-content`, so invalid frontmatter fails CI the same way a TypeScript error would. After merge, Vercel builds Blog with `pnpm exec nx build blog --configuration=production` and the new HTML goes live.

There is no separate “content deploy.” The content pipeline is part of the normal production build.

## Why static-first?

I did not choose static generation because dynamic systems are bad.

I chose it because I do not currently need runtime infrastructure for this problem.

The current characteristics are specific:

- One author
- Relatively infrequent publishing
- Git already provides version control, review, and rollback
- Articles are read much more often than they are written
- SEO matters
- The content is naturally text-based

So I would rather put complexity in the build than stand up a CMS, an API, a database, and a Node render path in order to print HTML that does not change between deploys.

Build-time complexity is preferable to runtime infrastructure here. That is an engineering judgment about this Blog, not a general law of content sites.

## Current limitations

These are deliberate trade-offs, not accidental omissions.

- **Publishing requires Git.** There is no browser editor.
- **Publishing requires CI and a production build.** A Markdown save is not a publish.
- **Publishing requires a deployment.** Content changes go live when Vercel ships the new static output.
- **No Admin UI, no CMS, no API, no database.**
- **Limited draft workflow.** Frontmatter `draft` keeps a URL off the site. It does not provide preview, scheduling, or private drafts. The source is still in the repository.
- **Content is repository-owned.** Access control is GitHub permissions, not an application session.
- **Slug changes 404.** Filename is URL. Redirects are not generated.
- **Build time grows with content.** Every article is validated, rendered, highlighted, and — if published — prerendered. That is fine at this size. It is a real cost if the archive becomes large.
- **Portfolio featured cards are duplicated presentation data.** The homepage does not import Blog. A new published article appears on `/blog` automatically; it appears on the Portfolio Engineering notes section only when that local list is updated. That duplication is documented, not accidental.

I would not call these failures. They are the price of keeping V1 small.

## When would I make the Blog dynamic?

Not because a database is available. Because the requirements changed.

I would reconsider Git-as-CMS if several of these became true:

- Someone who should not be in this repository needs to write
- I want browser-based editing instead of a pull request
- Publishing should not require a code change
- Scheduled publishing matters
- Revision management outgrows `git log`
- Editorial workflow appears — review, preview links, embargoes
- Media management becomes a product problem, not a few files in `public/`
- Content volume or publishing frequency makes rebuild-to-publish a bottleneck
- Content operations — not page rendering — are the thing slowing me down

Until then, adding an API would be infrastructure in search of a user.

## Future dynamic architecture

This section is future direction. None of it exists in the repository today.

```text
Today                         Future (possible)

Markdown                      Admin
   |                             |
   v                             v
prepare-content               Content API
   |                             |
   v                             v
GeneratedArticleRepository    Database
   |                             |
   v                             v
Blog                          ApiArticleRepository
                                 |
                                 v
                              Blog
```

The presentation layer — list, detail, SEO helpers, routes — should remain mostly unchanged. The content source changes. The `ArticleRepository` contract stays stable: published summaries, lookup by slug.

That is the migration I designed for. It is not a promise that I will build it on a timeline.

## Future Admin

Also future only. There is no `apps/admin` today.

A later Admin application would sit on a separate boundary (`admin.saleemkhan.dev` in the platform docs) and own authoring:

```text
Admin
  |
  +-- Create article
  +-- Edit article
  +-- Save draft
  +-- Preview
  +-- Publish
  +-- Unpublish
  |
  v
Content API
  |
  v
Database
```

Capabilities that would belong there, not in Blog: authentication, drafts with preview, publishing, scheduling, revisions, media management.

Blog would keep reading through a repository implementation. Admin would not import `apps/blog`, and Blog would not import Admin. Same rule as Portfolio and Blog today: applications do not depend on sibling applications.

## Dynamic content does not mean dynamic rendering

This is the distinction I do not want to lose if the Blog ever grows an Admin.

Even if articles eventually live in a database, I may still want static public delivery.

```text
Admin
   |
   v
API + Database
   |
   v
Build / revalidation
   |
   v
Static HTML
   |
   v
CDN
   |
   v
Reader
```

Dynamic authoring does not require dynamic rendering.

The content-management layer can become dynamic while the public reading experience stays static or cached. That keeps the things this Blog already optimizes for — SEO, CDN delivery, predictable public pages — and adds the things Git cannot do well: in-browser editing, publishing workflows, database-backed content.

I would evaluate that option when Admin exists. I would not switch the public site to per-request Markdown rendering just because the source moved out of Git.

## Migration path

Putting the three shapes next to each other:

```text
TODAY

Markdown → prepare-content → GeneratedArticleRepository → Blog


FUTURE (dynamic source, same UI contract)

Admin → API → Database → ApiArticleRepository → Blog


POSSIBLE MATURE SHAPE (dynamic source, static public delivery)

Admin → API → Database → build / revalidation → static/CDN → Blog
```

The migration should happen only when there is a real product requirement. The current system is simpler than any of the futures. The point of `ArticleRepository` is to keep the next step smaller than a rewrite — not to make today’s Blog look like the end state.

## What I am intentionally not building yet

The goal is not to design the final architecture on day one. The goal is to leave enough structure to evolve safely.

Intentionally deferred:

- Headless CMS
- MDX — Angular has no first-class MDX story comparable to Next.js; interactive demos can wait for a playground app
- Backend, database, Admin
- Search infrastructure
- Comments, likes, recommendations
- A generic content framework
- Shared content libraries
- Redis, Kafka, microservices

I already have a custom build-time pipeline. That is the complexity I _did_ accept, because Git-owned Markdown plus static prerender needed it. I did not accept a distributed content platform in order to publish four articles.

## Architectural lessons

These are specific to the Blog I actually built.

1. **Build-time work is often better than runtime work when content changes slowly.** `prepare-content` plus prerender is more machinery than `fetch('post.md')`, and it is the right machinery here.
2. **Git can be a valid CMS for a single-author engineering blog.** Pull requests, diffs, and `status: draft` are enough when the author already lives in the repository.
3. **Separate content authoring from presentation.** Markdown stays under `content/articles/`. Angular stays in `src/app`.
4. **Keep Markdown processing out of Angular components.** List and detail never import `gray-matter`, Marked, or Shiki.
5. **Keep application boundaries explicit.** Blog owns this pipeline. Portfolio links with public URLs. No shared content library yet.
6. **Use a small abstraction where it provides a realistic migration path.** `ArticleRepository` is two methods. That is the seam. It is not a platform SDK.
7. **Static delivery and dynamic content management are not opposites.** A future Admin can still publish to static HTML.
8. **Introduce infrastructure when requirements demand it.** A database is justified by authoring needs, not by the existence of Postgres.
9. **Avoid designing for scale that does not exist yet.** Four published articles do not need Kafka. They need valid frontmatter and a prerender list.
10. **Keep the migration path simpler than the current system.** If swapping `GeneratedArticleRepository` for an API-backed implementation requires rewriting the UI, the boundary failed.

The file I started with is still just Markdown in Git. The production URL is static HTML on a CDN. Everything between those two facts is a build — and that is currently enough.
