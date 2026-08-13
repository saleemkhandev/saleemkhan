import 'reflect-metadata';
import { bootstrap } from './bootstrap.js';
import { loadLocalEnvFile } from './config/load-env-file.js';

loadLocalEnvFile();

bootstrap().catch((error: unknown) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(message);
  process.exit(1);
});
