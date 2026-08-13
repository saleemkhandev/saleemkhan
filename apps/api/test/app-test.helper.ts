import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from '../src/bootstrap.js';

export async function createTestApp(
  env: NodeJS.ProcessEnv = {},
): Promise<NestFastifyApplication> {
  const { app } = await createApp({
    env: {
      NODE_ENV: 'test',
      HOST: '127.0.0.1',
      PORT: '3000',
      ...env,
    },
    logger: false,
  });

  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

export async function inject(
  app: NestFastifyApplication,
  options: {
    readonly method: 'GET' | 'POST';
    readonly url: string;
    readonly headers?: Record<string, string>;
  },
) {
  return app.getHttpAdapter().getInstance().inject({
    method: options.method,
    url: options.url,
    headers: options.headers,
  });
}
