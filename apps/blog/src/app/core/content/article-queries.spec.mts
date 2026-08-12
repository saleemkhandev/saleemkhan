import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Article, ArticleSummary } from '../models/article.ts';
import {
  compareSummariesNewestFirst,
  resolvePublishedArticle,
  toPublishedSummaries,
} from './article-queries.ts';

const manifest: ArticleSummary[] = [
  {
    slug: 'older-post',
    title: 'Older',
    description: 'Older post',
    publishedAt: '2026-08-01',
    status: 'published',
    tags: ['angular'],
  },
  {
    slug: 'draft-post',
    title: 'Draft',
    description: 'Draft post',
    publishedAt: '2026-08-10',
    status: 'draft',
    tags: ['nx'],
  },
  {
    slug: 'newer-post',
    title: 'Newer',
    description: 'Newer post',
    publishedAt: '2026-08-05',
    status: 'published',
    tags: ['architecture'],
  },
  {
    slug: 'same-day-a',
    title: 'Same day A',
    description: 'Tie breaker A',
    publishedAt: '2026-08-05',
    status: 'published',
    tags: [],
  },
];

const articlesBySlug: Record<string, Article> = {
  'newer-post': {
    ...manifest[2],
    contentHtml: '<p>Newer</p>',
  },
  'draft-post': {
    ...manifest[1],
    contentHtml: '<p>Draft</p>',
  },
};

describe('toPublishedSummaries', () => {
  it('excludes drafts', () => {
    const published = toPublishedSummaries(manifest);
    assert.deepEqual(
      published.map((article) => article.slug),
      ['newer-post', 'same-day-a', 'older-post'],
    );
    assert.ok(published.every((article) => article.status === 'published'));
  });

  it('orders newest first and uses slug ascending on ties', () => {
    const published = toPublishedSummaries(manifest);
    assert.equal(published[0]?.slug, 'newer-post');
    assert.equal(published[1]?.slug, 'same-day-a');
  });
});

describe('resolvePublishedArticle', () => {
  it('returns published articles by slug', () => {
    const article = resolvePublishedArticle(articlesBySlug, 'newer-post');
    assert.equal(article?.slug, 'newer-post');
    assert.equal(article?.contentHtml, '<p>Newer</p>');
  });

  it('returns null for drafts', () => {
    assert.equal(resolvePublishedArticle(articlesBySlug, 'draft-post'), null);
  });

  it('returns null for unknown slugs', () => {
    assert.equal(resolvePublishedArticle(articlesBySlug, 'missing'), null);
  });
});

describe('compareSummariesNewestFirst', () => {
  it('sorts by publishedAt descending', () => {
    assert.ok(compareSummariesNewestFirst(manifest[0], manifest[2]) > 0);
  });
});
