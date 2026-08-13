import { z } from 'zod';
import {
  DEFAULT_DEV_CORS_ORIGINS,
  DEFAULT_PRODUCTION_CORS_ORIGINS,
} from '../common/constants.js';

export const NODE_ENVIRONMENTS = ['development', 'test', 'production'] as const;

export type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];

const envSchema = z.object({
  NODE_ENV: z.enum(NODE_ENVIRONMENTS).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CORS_ORIGINS: z.string().optional(),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .optional(),
});

export type AppConfig = {
  readonly nodeEnv: NodeEnvironment;
  readonly host: string;
  readonly port: number;
  readonly corsOrigins: readonly string[];
  readonly logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse({
    NODE_ENV: env['NODE_ENV'],
    HOST: env['HOST'],
    PORT: env['PORT'],
    CORS_ORIGINS: env['CORS_ORIGINS'],
    LOG_LEVEL: env['LOG_LEVEL'],
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => {
        const path =
          issue.path.length > 0 ? issue.path.map(String).join('.') : '(root)';
        return `${path}: ${issue.message}`;
      })
      .join('\n');

    throw new Error(`Invalid API configuration:\n${details}`);
  }

  const nodeEnv = parsed.data.NODE_ENV;
  const corsOrigins = parseCorsOrigins(parsed.data.CORS_ORIGINS, nodeEnv);

  return {
    nodeEnv,
    host: parsed.data.HOST,
    port: parsed.data.PORT,
    corsOrigins,
    logLevel: parsed.data.LOG_LEVEL ?? defaultLogLevel(nodeEnv),
  };
}

function defaultLogLevel(nodeEnv: NodeEnvironment): AppConfig['logLevel'] {
  if (nodeEnv === 'production') {
    return 'info';
  }

  if (nodeEnv === 'test') {
    return 'error';
  }

  return 'debug';
}

function parseCorsOrigins(
  raw: string | undefined,
  nodeEnv: NodeEnvironment,
): readonly string[] {
  const origins =
    raw === undefined || raw.trim().length === 0
      ? defaultCorsOrigins(nodeEnv)
      : raw
          .split(',')
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0);

  if (origins.length === 0) {
    throw new Error(
      'Invalid API configuration:\nCORS_ORIGINS: must not be empty',
    );
  }

  if (origins.includes('*') && nodeEnv === 'production') {
    throw new Error(
      'Invalid API configuration:\nCORS_ORIGINS: wildcard origin * is not allowed in production',
    );
  }

  return origins;
}

function defaultCorsOrigins(nodeEnv: NodeEnvironment): readonly string[] {
  if (nodeEnv === 'production') {
    return [...DEFAULT_PRODUCTION_CORS_ORIGINS];
  }

  return [...DEFAULT_DEV_CORS_ORIGINS];
}
