import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadConfig } from './configuration.js';

describe('loadConfig', () => {
  it('applies development defaults', () => {
    const config = loadConfig({
      NODE_ENV: 'development',
    });

    assert.equal(config.nodeEnv, 'development');
    assert.equal(config.host, '0.0.0.0');
    assert.equal(config.port, 3000);
    assert.equal(config.logLevel, 'debug');
    assert.ok(config.corsOrigins.includes('http://localhost:4200'));
    assert.equal(config.corsOrigins.includes('*'), false);
  });

  it('uses production CORS defaults without a wildcard', () => {
    const config = loadConfig({
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: '3000',
    });

    assert.deepEqual(config.corsOrigins, ['https://saleemkhan.dev']);
    assert.equal(config.logLevel, 'info');
  });

  it('parses CORS_ORIGINS as a comma-separated allowlist', () => {
    const config = loadConfig({
      NODE_ENV: 'development',
      CORS_ORIGINS: 'http://localhost:4200, https://saleemkhan.dev',
    });

    assert.deepEqual(config.corsOrigins, [
      'http://localhost:4200',
      'https://saleemkhan.dev',
    ]);
  });

  it('rejects an invalid PORT', () => {
    assert.throws(
      () =>
        loadConfig({
          NODE_ENV: 'development',
          HOST: '0.0.0.0',
          PORT: 'not-a-port',
        }),
      /Invalid API configuration/,
    );
  });

  it('rejects an invalid NODE_ENV', () => {
    assert.throws(
      () =>
        loadConfig({
          NODE_ENV: 'staging',
          HOST: '0.0.0.0',
          PORT: '3000',
        }),
      /Invalid API configuration/,
    );
  });

  it('rejects a wildcard CORS origin in production', () => {
    assert.throws(
      () =>
        loadConfig({
          NODE_ENV: 'production',
          HOST: '0.0.0.0',
          PORT: '3000',
          CORS_ORIGINS: '*',
        }),
      /wildcard origin/,
    );
  });

  it('rejects an empty CORS_ORIGINS override', () => {
    assert.throws(
      () =>
        loadConfig({
          NODE_ENV: 'development',
          CORS_ORIGINS: '   ,  ',
        }),
      /CORS_ORIGINS/,
    );
  });
});
