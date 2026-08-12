import { Article, ArticleSummary } from '../models/article';

/**
 * Public Blog content boundary.
 *
 * Implementations must serve generated article data only — never Markdown,
 * filesystem paths, or build-tool parsers.
 */
export abstract class ArticleRepository {
  /**
   * Published articles only, newest `publishedAt` first (slug ascending on ties).
   */
  abstract getPublished(): readonly ArticleSummary[];

  /**
   * Returns a published article by slug, or `null` when missing or draft.
   */
  abstract getBySlug(slug: string): Article | null;
}
