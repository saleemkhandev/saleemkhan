import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveRequestId } from './request-id.js';

describe('resolveRequestId', () => {
  it('reuses a safe incoming request id', () => {
    assert.equal(resolveRequestId('req-123.abc:1'), 'req-123.abc:1');
  });

  it('generates a UUID when the header is missing', () => {
    assert.match(
      resolveRequestId(undefined),
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('rejects unsafe incoming values', () => {
    const generated = resolveRequestId('has space / and; punctuation');
    assert.notEqual(generated, 'has space / and; punctuation');
    assert.match(generated, /^[0-9a-f-]{36}$/i);
  });

  it('rejects duplicate header arrays', () => {
    const generated = resolveRequestId(['a', 'b']);
    assert.notDeepEqual(generated, ['a', 'b']);
    assert.match(generated, /^[0-9a-f-]{36}$/i);
  });
});
