import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { DatabaseService } from '../src/database/database.service.js';
import { createTestApp, inject } from './app-test.helper.js';
import {
  applyTestMigrations,
  ensureTestDatabase,
  testDatabaseUrl,
} from './database-test.helper.js';

describe('database integration', () => {
  const databaseUrl = testDatabaseUrl();
  let app: NestFastifyApplication;

  before(async () => {
    await ensureTestDatabase(databaseUrl);
    await applyTestMigrations(databaseUrl);
    app = await createTestApp({
      DATABASE_URL: databaseUrl,
    });
  });

  after(async () => {
    await app.close();
  });

  it('initializes Drizzle and executes SELECT 1', async () => {
    const database = app.get(DatabaseService);
    assert.equal(await database.ping(), true);

    const result = await database.db.execute(sql`SELECT 1 AS ok`);
    assert.ok(result !== undefined);
  });

  it('returns 200 from GET /v1/ready when PostgreSQL is reachable', async () => {
    const response = await inject(app, { method: 'GET', url: '/v1/ready' });
    const body = response.json() as {
      status: string;
      checks: { application: string; database: string };
    };

    assert.equal(response.statusCode, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.checks.application, 'ok');
    assert.equal(body.checks.database, 'ok');
    assert.equal(JSON.stringify(body).includes('postgresql://'), false);
  });

  it('keeps GET /v1/health independent of PostgreSQL', async () => {
    const response = await inject(app, { method: 'GET', url: '/v1/health' });
    const body = response.json() as Record<string, unknown>;

    assert.equal(response.statusCode, 200);
    assert.equal(body['status'], 'ok');
    assert.equal(body['checks'], undefined);
  });

  it('applies versioned migrations idempotently', async () => {
    await applyTestMigrations(databaseUrl);
    await applyTestMigrations(databaseUrl);

    const client = postgres(databaseUrl, {
      max: 1,
      connect_timeout: 3,
      onnotice: () => undefined,
    });

    try {
      const result = await client`SELECT 1 AS ok`;
      assert.equal(result[0]?.['ok'], 1);
    } finally {
      await client.end({ timeout: 5 });
    }
  });
});
