/**
 * Portfolio-local featured article metadata.
 *
 * This is intentionally duplicated presentation data for the Portfolio
 * homepage. It is NOT the Blog's source of truth.
 *
 * Source of truth: Markdown under `apps/blog/content/articles/`
 * (see ADR-0003). Blog remains independently deployed.
 *
 * Portfolio talks to Blog through public URLs only:
 *   /blog
 *   /blog/<slug>
 *
 * Do not import `apps/blog` into Portfolio. Do not introduce a shared
 * content library or API for this list. A public content API can replace
 * this duplication later, when an Admin/content platform exists.
 *
 * Keep this list to the latest 2–3 published articles, newest first.
 * Do not include drafts.
 */

export interface FeaturedArticle {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** ISO calendar date `YYYY-MM-DD`. */
  readonly publishedAt: string;
  readonly tags: readonly string[];
}

/** Public path where the independently deployed Blog is mounted. */
export const BLOG_INDEX_PATH = '/blog';

export const FEATURED_ARTICLES = [
  {
    slug: 'frontend-architecture',
    title: 'Frontend Architecture for a Personal Platform',
    description:
      'A pragmatic layering model for Angular apps that stay thin, avoid speculative libraries, and still leave room to grow.',
    publishedAt: '2026-08-05',
    tags: ['frontend-architecture', 'angular', 'architecture'],
  },
  {
    slug: 'building-an-angular-monorepo',
    title: 'Building an Angular Monorepo',
    description:
      'How saleem-platform grew from a single portfolio into an Nx workspace with independently buildable applications.',
    publishedAt: '2026-08-01',
    tags: ['angular', 'nx', 'monorepo'],
  },
] as const satisfies readonly FeaturedArticle[];

export function blogArticlePath(slug: string): string {
  return `${BLOG_INDEX_PATH}/${slug}`;
}

/**
 * Formats featured-article `publishedAt` (`YYYY-MM-DD`) for display using the
 * UTC calendar date. Portfolio-local — not imported from Blog.
 */
export function formatFeaturedArticleDate(publishedAt: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(publishedAt);
  if (!match) {
    return publishedAt;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
