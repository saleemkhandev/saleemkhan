import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Loads `apps/api/.env` into `process.env` when present.
 * Existing environment variables are not overwritten.
 */
export function loadLocalEnvFile(): void {
  const candidates = [
    resolve(process.cwd(), 'apps/api/.env'),
    resolve(process.cwd(), '.env'),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      process.loadEnvFile(path);
      return;
    }
  }
}
