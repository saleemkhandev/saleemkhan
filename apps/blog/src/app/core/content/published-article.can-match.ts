import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { ArticleRepository } from './article-repository';

/**
 * Only published article slugs match the detail route.
 * Drafts and unknown slugs fall through to the not-found route.
 */
export const publishedArticleCanMatch: CanMatchFn = (_route, segments) => {
  const slug = segments[0]?.path;
  if (!slug) {
    return false;
  }

  return inject(ArticleRepository).getBySlug(slug) !== null;
};
