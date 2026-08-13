import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DatabaseService } from './database.service.js';
import { loadConfig } from '../config/configuration.js';

describe('DatabaseService', () => {
  it('reports unavailable when DATABASE_URL is omitted in test', async () => {
    const service = new DatabaseService(
      loadConfig({
        NODE_ENV: 'test',
      }),
    );

    assert.equal(await service.ping(), false);
    assert.throws(() => service.db, /not configured/);
    await service.onModuleDestroy();
  });

  it('closes a configured client without leaking the connection', async () => {
    const service = new DatabaseService(
      loadConfig({
        NODE_ENV: 'test',
        DATABASE_URL:
          'postgresql://postgres:postgres@127.0.0.1:1/saleem_platform_test',
      }),
    );

    await service.onModuleDestroy();
  });
});
