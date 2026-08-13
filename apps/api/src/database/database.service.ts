import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import { APP_CONFIG } from '../config/configuration.js';
import type { AppConfig } from '../config/configuration.js';
import { schema } from './schema/index.js';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly client: Sql | undefined;
  private readonly drizzleDb: PostgresJsDatabase<typeof schema> | undefined;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    if (config.databaseUrl === undefined) {
      return;
    }

    this.client = postgres(config.databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 3,
      onnotice: () => undefined,
    });
    this.drizzleDb = drizzle(this.client, { schema });
  }

  get db(): PostgresJsDatabase<typeof schema> {
    if (this.drizzleDb === undefined) {
      throw new Error('Database is not configured');
    }

    return this.drizzleDb;
  }

  async ping(): Promise<boolean> {
    if (this.drizzleDb === undefined) {
      return false;
    }

    try {
      await this.drizzleDb.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client !== undefined) {
      await this.client.end({ timeout: 5 });
    }
  }
}
