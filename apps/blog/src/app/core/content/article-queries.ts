import type { Article, ArticleSummary } from '../models/article';

/**
 * Pure Blog catalog helpers used by GeneratedArticleRepository.
 * Kept free of Angular DI so unit tests can exercise them without a test runner framework.
 */

export function toPublishedSummaries(
  manifest: readonly ArticleSummary[],
): ArticleSummary[] {
  return manifest
    .filter((article) => article.status === 'published')
    .map((article) => ({
      slug: article.slug,
      title: article.title,
      description: article.description,
      publishedAt: article.publishedAt,
      status: article.status,
      tags: [...article.tags],
    }))
    .sort(compareSummariesNewestFirst);
}

export function resolvePublishedArticle(
  articlesBySlug: Readonly<Record<string, Article>>,
  slug: string,
): Article | null {
  if (!(slug in articlesBySlug)) {
    return null;
  }

  const article = articlesBySlug[slug];

  if (article.status !== 'published') {
    return null;
  }

  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    publishedAt: article.publishedAt,
    status: article.status,
    tags: [...article.tags],
    contentHtml: article.contentHtml,
  };
}

export function compareSummariesNewestFirst(
  left: ArticleSummary,
  right: ArticleSummary,
): number {
  if (left.publishedAt === right.publishedAt) {
    return left.slug.localeCompare(right.slug);
  }

  return right.publishedAt.localeCompare(left.publishedAt);
}
