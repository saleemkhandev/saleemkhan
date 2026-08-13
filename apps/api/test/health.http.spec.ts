import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { API_VERSION, SERVICE_NAME } from '../src/common/constants.js';
import { createTestApp, inject } from './app-test.helper.js';

describe('GET /v1/health', () => {
  let app: NestFastifyApplication;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
  });

  it('returns 200 with process health metadata', async () => {
    const response = await inject(app, { method: 'GET', url: '/v1/health' });
    const body = response.json() as Record<string, unknown>;

    assert.equal(response.statusCode, 200);
    assert.equal(body['status'], 'ok');
    assert.equal(body['service'], SERVICE_NAME);
    assert.equal(body['version'], API_VERSION);
    assert.equal(body['NODE_ENV'], undefined);
    assert.equal(body['DATABASE_URL'], undefined);
  });
});

describe('GET /v1/ready', () => {
  let app: NestFastifyApplication;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
  });

  it('returns 200 when the application has initialized', async () => {
    const response = await inject(app, { method: 'GET', url: '/v1/ready' });
    const body = response.json() as {
      status: string;
      checks: { application: string };
    };

    assert.equal(response.statusCode, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.checks.application, 'ok');
    assert.equal(
      'database' in body.checks,
      false,
      'must not pretend a database exists',
    );
  });
});
