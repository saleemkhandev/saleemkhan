import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'drizzle-kit';

const configDir = dirname(fileURLToPath(import.meta.url));

function loadDatabaseUrl(): string {
  const envFiles = [
    resolve(configDir, '.env'),
    resolve(process.cwd(), 'apps/api/.env'),
    resolve(process.cwd(), '.env'),
  ];

  for (const envFile of envFiles) {
    if (existsSync(envFile)) {
      process.loadEnvFile(envFile);
      break;
    }
  }

  const databaseUrl = process.env['DATABASE_URL']?.trim();
  if (databaseUrl !== undefined && databaseUrl.length > 0) {
    return databaseUrl;
  }

  return 'postgresql://postgres:postgres@localhost:5432/saleem_platform';
}

export default defineConfig({
  schema: resolve(configDir, 'src/database/schema/index.ts'),
  out: resolve(configDir, 'drizzle/migrations'),
  dialect: 'postgresql',
  dbCredentials: {
    url: loadDatabaseUrl(),
  },
});
