import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadConfig } from './configuration.js';

const EXAMPLE_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/saleem_platform';

describe('loadConfig', () => {
  it('applies development defaults', () => {
    const config = loadConfig({
      NODE_ENV: 'development',
      DATABASE_URL: EXAMPLE_DATABASE_URL,
    });

    assert.equal(config.nodeEnv, 'development');
    assert.equal(config.host, '0.0.0.0');
    assert.equal(config.port, 3000);
    assert.equal(config.logLevel, 'debug');
    assert.equal(config.databaseUrl, EXAMPLE_DATABASE_URL);
    assert.ok(config.corsOrigins.includes('http://localhost:4200'));
    assert.equal(config.corsOrigins.includes('*'), false);
  });

  it('uses production CORS defaults without a wildcard', () => {
    const config = loadConfig({
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: '3000',
      DATABASE_URL: EXAMPLE_DATABASE_URL,
    });

    assert.deepEqual(config.corsOrigins, ['https://saleemkhan.dev']);
    assert.equal(config.logLevel, 'info');
    assert.equal(config.databaseUrl, EXAMPLE_DATABASE_URL);
  });

  it('parses CORS_ORIGINS as a comma-separated allowlist', () => {
    const config = loadConfig({
      NODE_ENV: 'development',
      CORS_ORIGINS: 'http://localhost:4200, https://saleemkhan.dev',
      DATABASE_URL: EXAMPLE_DATABASE_URL,
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
          DATABASE_URL: EXAMPLE_DATABASE_URL,
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
          DATABASE_URL: EXAMPLE_DATABASE_URL,
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
          DATABASE_URL: EXAMPLE_DATABASE_URL,
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
          DATABASE_URL: EXAMPLE_DATABASE_URL,
        }),
      /CORS_ORIGINS/,
    );
  });

  it('requires DATABASE_URL in development', () => {
    assert.throws(
      () =>
        loadConfig({
          NODE_ENV: 'development',
        }),
      /DATABASE_URL/,
    );
  });

  it('requires DATABASE_URL in production', () => {
    assert.throws(
      () =>
        loadConfig({
          NODE_ENV: 'production',
          HOST: '0.0.0.0',
          PORT: '3000',
        }),
      /DATABASE_URL/,
    );
  });

  it('allows omitting DATABASE_URL in test', () => {
    const config = loadConfig({
      NODE_ENV: 'test',
    });

    assert.equal(config.databaseUrl, undefined);
    assert.equal(config.logLevel, 'error');
  });

  it('accepts postgres:// URLs', () => {
    const config = loadConfig({
      NODE_ENV: 'development',
      DATABASE_URL:
        'postgres://postgres:postgres@localhost:5432/saleem_platform',
    });

    assert.equal(
      config.databaseUrl,
      'postgres://postgres:postgres@localhost:5432/saleem_platform',
    );
  });

  it('rejects a non-postgres DATABASE_URL', () => {
    assert.throws(
      () =>
        loadConfig({
          NODE_ENV: 'development',
          DATABASE_URL: 'mysql://localhost:3306/saleem_platform',
        }),
      /postgresql:\/\//,
    );
  });

  it('rejects an invalid DATABASE_URL in test when provided', () => {
    assert.throws(
      () =>
        loadConfig({
          NODE_ENV: 'test',
          DATABASE_URL: 'not-a-url',
        }),
      /DATABASE_URL/,
    );
  });
});
