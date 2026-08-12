import { Injectable } from '@angular/core';
import { ARTICLE_MANIFEST } from '../../generated/articles.manifest';
import { ARTICLES_BY_SLUG } from '../../generated/articles.registry';
import { Article, ArticleSummary } from '../models/article';
import { ArticleRepository } from './article-repository';
import {
  resolvePublishedArticle,
  toPublishedSummaries,
} from './article-queries';

/**
 * Reads only build-generated article modules.
 * Does not touch Markdown, gray-matter, marked, Shiki, or the filesystem.
 */
@Injectable()
export class GeneratedArticleRepository extends ArticleRepository {
  override getPublished(): readonly ArticleSummary[] {
    return toPublishedSummaries(ARTICLE_MANIFEST);
  }

  override getBySlug(slug: string): Article | null {
    return resolvePublishedArticle(ARTICLES_BY_SLUG, slug);
  }
}
