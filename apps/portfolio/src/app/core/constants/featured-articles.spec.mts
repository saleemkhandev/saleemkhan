import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BLOG_INDEX_PATH,
  FEATURED_ARTICLES,
  blogArticlePath,
  formatFeaturedArticleDate,
} from './featured-articles.ts';

describe('FEATURED_ARTICLES', () => {
  it('lists two or three published articles with required metadata', () => {
    assert.ok(FEATURED_ARTICLES.length >= 2);
    assert.ok(FEATURED_ARTICLES.length <= 3);

    for (const article of FEATURED_ARTICLES) {
      assert.ok(article.slug.length > 0);
      assert.ok(article.title.length > 0);
      assert.ok(article.description.length > 0);
      assert.match(article.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(Array.isArray(article.tags));
    }
  });

  it('orders articles newest first', () => {
    const dates = FEATURED_ARTICLES.map((article) => article.publishedAt);
    const sorted = [...dates].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    assert.deepEqual(dates, sorted);
  });
});

describe('blogArticlePath', () => {
  it('builds public Blog article URLs from slugs', () => {
    assert.equal(BLOG_INDEX_PATH, '/blog');
    assert.equal(
      blogArticlePath('frontend-architecture'),
      '/blog/frontend-architecture',
    );
    assert.equal(
      blogArticlePath('building-an-angular-monorepo'),
      '/blog/building-an-angular-monorepo',
    );
  });

  it('matches a path for every featured article', () => {
    for (const article of FEATURED_ARTICLES) {
      assert.equal(blogArticlePath(article.slug), `/blog/${article.slug}`);
    }
  });
});

describe('formatFeaturedArticleDate', () => {
  it('formats valid ISO calendar dates in UTC', () => {
    assert.equal(formatFeaturedArticleDate('2026-08-01'), 'Aug 1, 2026');
    assert.equal(formatFeaturedArticleDate('2026-08-05'), 'Aug 5, 2026');
  });

  it('returns the original value for invalid input', () => {
    assert.equal(formatFeaturedArticleDate('not-a-date'), 'not-a-date');
  });
});
