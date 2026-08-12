/**
 * Blog V1 article content contract.
 *
 * Markdown under `apps/blog/content/articles/` is the source of truth.
 * Build-time generation populates runtime data that conforms to these types.
 * Presentation must not read Markdown files.
 *
 * Trust boundary for `contentHtml`:
 * Git-owned Markdown → build-time Marked (raw HTML stripped) + Shiki →
 * generated modules → Angular. Not safe for arbitrary CMS/user HTML.
 */

export type ArticleStatus = 'draft' | 'published';

/**
 * List/catalog representation — no rendered body.
 */
export interface ArticleSummary {
  /** Derived from the Markdown filename (e.g. `building-an-angular-monorepo`). */
  readonly slug: string;
  readonly title: string;
  /** Also used as the list-page excerpt. */
  readonly description: string;
  /** ISO date string `YYYY-MM-DD`. */
  readonly publishedAt: string;
  readonly status: ArticleStatus;
  readonly tags: readonly string[];
}

/**
 * Detail representation for a fully prepared article.
 * `contentHtml` is produced by `blog:prepare-content` (build-time pipeline).
 */
export interface Article extends ArticleSummary {
  /** Trusted HTML generated at build time by Marked + Shiki. */
  readonly contentHtml: string;
}
