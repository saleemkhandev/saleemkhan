import { resolve } from 'node:path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const TEST_DATABASE_NAME = 'saleem_platform_test';

export const DEFAULT_TEST_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/saleem_platform_test';

export function testDatabaseUrl(): string {
  const fromEnv = process.env['TEST_DATABASE_URL']?.trim();
  if (fromEnv !== undefined && fromEnv.length > 0) {
    return fromEnv;
  }

  return DEFAULT_TEST_DATABASE_URL;
}

export async function ensureTestDatabase(databaseUrl: string): Promise<void> {
  const url = new URL(databaseUrl);
  const databaseName = url.pathname.replace(/^\//, '');

  if (databaseName !== TEST_DATABASE_NAME) {
    throw new Error(
      `Refusing to manage unexpected test database "${databaseName}". Expected ${TEST_DATABASE_NAME}.`,
    );
  }

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';

  const sql = postgres(adminUrl.toString(), {
    max: 1,
    connect_timeout: 3,
    onnotice: () => undefined,
  });

  try {
    const existing = await sql`
      SELECT 1 FROM pg_database WHERE datname = ${databaseName}
    `;

    if (existing.length === 0) {
      await sql.unsafe(`CREATE DATABASE ${TEST_DATABASE_NAME}`);
    }
  } catch (error: unknown) {
    throw new Error(
      [
        'PostgreSQL is required for API database integration tests.',
        'Start it with: docker compose up -d postgres',
        `Expected database: ${TEST_DATABASE_NAME} on localhost:5432`,
        sanitizeErrorMessage(error),
      ].join('\n'),
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

function sanitizeErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  return raw.replace(/(?:postgres|postgresql):\/\/[^\s]+/gi, '[Redacted]');
}

export async function applyTestMigrations(databaseUrl: string): Promise<void> {
  const sql = postgres(databaseUrl, {
    max: 1,
    connect_timeout: 3,
    onnotice: () => undefined,
  });

  try {
    await migrate(drizzle(sql), {
      migrationsFolder: resolve(process.cwd(), 'apps/api/drizzle/migrations'),
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}
