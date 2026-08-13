import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { REQUEST_ID_HEADER } from '../src/common/constants.js';
import { createTestApp, inject } from './app-test.helper.js';

describe('request id', () => {
  let app: NestFastifyApplication;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
  });

  it('echoes a safe incoming x-request-id', async () => {
    const response = await inject(app, {
      method: 'GET',
      url: '/v1/health',
      headers: { [REQUEST_ID_HEADER]: 'client-req-1' },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers[REQUEST_ID_HEADER], 'client-req-1');
  });

  it('generates an id when none is supplied', async () => {
    const response = await inject(app, {
      method: 'GET',
      url: '/v1/health',
    });

    assert.equal(response.statusCode, 200);
    assert.match(
      String(response.headers[REQUEST_ID_HEADER]),
      /^[0-9a-f-]{36}$/i,
    );
  });

  it('replaces an unsafe incoming id', async () => {
    const unsafe = 'not a safe id!!!';
    const response = await inject(app, {
      method: 'GET',
      url: '/v1/health',
      headers: { [REQUEST_ID_HEADER]: unsafe },
    });

    assert.equal(response.statusCode, 200);
    assert.notEqual(response.headers[REQUEST_ID_HEADER], unsafe);
    assert.match(
      String(response.headers[REQUEST_ID_HEADER]),
      /^[0-9a-f-]{36}$/i,
    );
  });
});
