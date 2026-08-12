import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  assertValidSlug,
  ContentValidationError,
  validateFrontmatter,
} from './content-validation.mjs';

const validFrontmatter = {
  title: 'Example Article',
  description: 'A short description.',
  publishedAt: '2026-08-01',
  status: 'published',
  tags: ['angular', 'nx'],
};

describe('assertValidSlug', () => {
  it('accepts lowercase kebab-case slugs', () => {
    assert.doesNotThrow(() =>
      assertValidSlug(
        'articles/building-an-angular-monorepo.md',
        'building-an-angular-monorepo',
      ),
    );
  });

  it('rejects invalid slugs', () => {
    assert.throws(
      () => assertValidSlug('articles/Bad_Slug.md', 'Bad_Slug'),
      (error) =>
        error instanceof ContentValidationError &&
        error.message.includes('Invalid slug'),
    );
  });
});

describe('validateFrontmatter', () => {
  it('accepts valid published frontmatter', () => {
    const result = validateFrontmatter('articles/example.md', validFrontmatter);
    assert.deepEqual(result, {
      title: 'Example Article',
      description: 'A short description.',
      publishedAt: '2026-08-01',
      status: 'published',
      tags: ['angular', 'nx'],
    });
  });

  it('accepts draft status', () => {
    const result = validateFrontmatter('articles/example.md', {
      ...validFrontmatter,
      status: 'draft',
    });
    assert.equal(result.status, 'draft');
  });

  it('rejects missing title', () => {
    const withoutTitle = {
      description: validFrontmatter.description,
      publishedAt: validFrontmatter.publishedAt,
      status: validFrontmatter.status,
      tags: validFrontmatter.tags,
    };
    assert.throws(
      () => validateFrontmatter('articles/example.md', withoutTitle),
      (error) =>
        error instanceof ContentValidationError &&
        error.message.includes('Field: title'),
    );
  });

  it('rejects invalid calendar dates', () => {
    assert.throws(
      () =>
        validateFrontmatter('articles/example.md', {
          ...validFrontmatter,
          publishedAt: '2026-02-30',
        }),
      (error) =>
        error instanceof ContentValidationError &&
        error.message.includes('Field: publishedAt'),
    );
  });

  it('rejects unknown status values', () => {
    assert.throws(
      () =>
        validateFrontmatter('articles/example.md', {
          ...validFrontmatter,
          status: 'archived',
        }),
      (error) =>
        error instanceof ContentValidationError &&
        error.message.includes('Field: status'),
    );
  });

  it('rejects invalid tags', () => {
    assert.throws(
      () =>
        validateFrontmatter('articles/example.md', {
          ...validFrontmatter,
          tags: ['Angular'],
        }),
      (error) =>
        error instanceof ContentValidationError &&
        error.message.includes('Field: tags'),
    );
  });
});
