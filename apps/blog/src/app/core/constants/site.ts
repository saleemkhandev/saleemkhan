/**
 * Blog-local site constants.
 *
 * Public production URLs use the platform domain with Blog mounted at `/blog`.
 * The Angular app continues to route internally as `/` and `/:slug`; the
 * deployment layer (baseHref + Vercel path routing) handles the public mount.
 */
export const BLOG_SITE = {
  name: 'Saleem Khan',
  author: 'Saleem Khan',
  siteName: 'Saleem Khan · Engineering Blog',
  domain: 'https://saleemkhan.dev',
  /** Public path prefix where Blog is mounted in production. */
  basePath: '/blog',
  listTitle: 'Engineering Blog | Saleem Khan',
  listDescription:
    'Engineering blog by Saleem Khan — articles on frontend architecture, Angular, Nx, and software engineering.',
  portfolioUrl: 'https://saleemkhan.dev/',
} as const;

/** Absolute public URL for the Blog index (`https://saleemkhan.dev/blog/`). */
export function blogIndexUrl(): string {
  return `${BLOG_SITE.domain}${BLOG_SITE.basePath}/`;
}

/** Absolute public URL for a published article. */
export function blogArticleUrl(slug: string): string {
  return `${BLOG_SITE.domain}${BLOG_SITE.basePath}/${slug}`;
}

/** Absolute public URL for the Blog sitemap. */
export function blogSitemapUrl(): string {
  return `${BLOG_SITE.domain}${BLOG_SITE.basePath}/sitemap.xml`;
}

/** Absolute public URL for the Blog RSS feed. */
export function blogRssUrl(): string {
  return `${BLOG_SITE.domain}${BLOG_SITE.basePath}/rss.xml`;
}
