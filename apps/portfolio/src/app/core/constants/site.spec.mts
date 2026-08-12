import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildJsonLd, SITE } from './site.ts';

describe('buildJsonLd', () => {
  it('builds schema.org graph with website and person nodes', () => {
    const jsonLd = buildJsonLd();
    const graph = jsonLd['@graph'];

    assert.equal(jsonLd['@context'], 'https://schema.org');
    assert.ok(Array.isArray(graph));

    const website = graph.find(
      (node) =>
        typeof node === 'object' &&
        node !== null &&
        '@type' in node &&
        node['@type'] === 'WebSite',
    );
    const person = graph.find(
      (node) =>
        typeof node === 'object' &&
        node !== null &&
        '@type' in node &&
        node['@type'] === 'Person',
    );

    assert.ok(website);
    assert.ok(person);
    assert.equal(
      typeof person === 'object' && person !== null && 'name' in person
        ? person.name
        : undefined,
      SITE.name,
    );
  });
});
