import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  applyTheme,
  nextTheme,
  persistTheme,
  readDocumentTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
} from './theme.ts';

describe('resolveTheme', () => {
  it('uses a stored light or dark preference', () => {
    assert.equal(resolveTheme('light', false), 'light');
    assert.equal(resolveTheme('dark', true), 'dark');
  });

  it('falls back to the system preference when nothing is stored', () => {
    assert.equal(resolveTheme(null, true), 'light');
    assert.equal(resolveTheme('system', false), 'dark');
  });
});

describe('nextTheme', () => {
  it('toggles between dark and light', () => {
    assert.equal(nextTheme('dark'), 'light');
    assert.equal(nextTheme('light'), 'dark');
  });
});

describe('readDocumentTheme', () => {
  it('treats anything other than light as dark', () => {
    assert.equal(readDocumentTheme({ getAttribute: () => 'light' }), 'light');
    assert.equal(readDocumentTheme({ getAttribute: () => 'dark' }), 'dark');
    assert.equal(readDocumentTheme({ getAttribute: () => null }), 'dark');
  });
});

describe('persistTheme', () => {
  it('writes the shared storage key', () => {
    const storage = new Map<string, string>();

    persistTheme('light', {
      setItem: (key, value) => {
        storage.set(key, value);
      },
    });

    assert.equal(storage.get(THEME_STORAGE_KEY), 'light');
  });
});

describe('applyTheme', () => {
  it('updates the document theme and browser chrome color', () => {
    const attrs = new Map<string, string>();
    const root = {
      style: { colorScheme: '' },
      setAttribute: (name: string, value: string) => {
        attrs.set(name, value);
      },
    };
    const meta = {
      content: '',
      setAttribute: (name: string, value: string) => {
        if (name === 'content') {
          meta.content = value;
        }
      },
    };

    applyTheme(root, 'light', meta, { dark: '#0d0d0d', light: '#f4f1ec' });

    assert.equal(attrs.get('data-theme'), 'light');
    assert.equal(root.style.colorScheme, 'light');
    assert.equal(meta.content, '#f4f1ec');
  });
});
