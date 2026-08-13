import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from '../src/bootstrap.js';
import { createTestApp, inject } from './app-test.helper.js';

describe('application bootstrap', () => {
  let app: NestFastifyApplication;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
  });

  it('exposes OpenAPI UI and the machine-readable document', async () => {
    const docs = await inject(app, { method: 'GET', url: '/docs' });
    const spec = await inject(app, { method: 'GET', url: '/openapi.json' });
    const document = spec.json() as {
      info: { title: string };
      paths: Record<string, unknown>;
    };

    assert.equal(docs.statusCode, 200);
    assert.match(docs.headers['content-type'] ?? '', /text\/html/);
    assert.equal(spec.statusCode, 200);
    assert.equal(document.info.title, 'Developer Platform API');
    assert.ok(document.paths['/v1/health']);
    assert.ok(document.paths['/v1/ready']);
    assert.equal(document.paths['/v1/projects'], undefined);
    assert.equal(document.paths['/v1/articles'], undefined);
  });

  it('sets baseline security headers', async () => {
    const response = await inject(app, { method: 'GET', url: '/v1/health' });
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
  });
});

describe('createApp configuration failures', () => {
  it('fails startup on invalid configuration', async () => {
    await assert.rejects(
      () =>
        createApp({
          env: {
            NODE_ENV: 'development',
            HOST: '0.0.0.0',
            PORT: '0',
            DATABASE_URL:
              'postgresql://postgres:postgres@localhost:5432/saleem_platform',
          },
          logger: false,
        }),
      /Invalid API configuration/,
    );
  });

  it('fails startup when DATABASE_URL is missing in development', async () => {
    await assert.rejects(
      () =>
        createApp({
          env: {
            NODE_ENV: 'development',
            HOST: '0.0.0.0',
            PORT: '3000',
          },
          logger: false,
        }),
      /DATABASE_URL/,
    );
  });
});
