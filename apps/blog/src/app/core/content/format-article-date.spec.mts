import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatArticleDate } from './format-article-date.ts';

describe('formatArticleDate', () => {
  it('formats valid ISO calendar dates in UTC', () => {
    assert.equal(formatArticleDate('2026-08-01'), 'Aug 1, 2026');
  });

  it('returns the original value for invalid input', () => {
    assert.equal(formatArticleDate('not-a-date'), 'not-a-date');
  });
});
