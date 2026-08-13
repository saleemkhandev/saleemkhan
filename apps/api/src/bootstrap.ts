import helmet from '@fastify/helmet';
import { RequestMethod } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import type { IncomingMessage } from 'node:http';
import { AppModule } from './app/app.module.js';
import { GLOBAL_PREFIX, REQUEST_ID_HEADER } from './common/constants.js';
import { createFastifyLoggerOptions } from './common/logging/logger.js';
import { setupOpenApi } from './common/openapi/openapi.js';
import { resolveRequestId } from './common/request-id/request-id.js';
import { AppConfig, loadConfig } from './config/configuration.js';

export interface CreateAppOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly logger?: boolean;
}

export interface CreatedApp {
  readonly app: NestFastifyApplication;
  readonly config: AppConfig;
}

export async function createApp(
  options: CreateAppOptions = {},
): Promise<CreatedApp> {
  const config = loadConfig(options.env ?? process.env);
  const enableLogger = options.logger ?? config.nodeEnv !== 'test';

  const adapter = new FastifyAdapter({
    logger: enableLogger ? createFastifyLoggerOptions(config) : false,
    genReqId: (request: IncomingMessage) =>
      resolveRequestId(request.headers[REQUEST_ID_HEADER]),
    // Fastify would otherwise copy an unsanitized incoming request-id header.
    requestIdHeader: false,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      bufferLogs: enableLogger,
      logger: enableLogger ? undefined : false,
    },
  );

  app.setGlobalPrefix(GLOBAL_PREFIX, {
    exclude: [
      { path: 'docs', method: RequestMethod.ALL },
      { path: 'docs-json', method: RequestMethod.ALL },
      { path: 'docs-yaml', method: RequestMethod.ALL },
      { path: 'openapi.json', method: RequestMethod.ALL },
    ],
  });

  app.enableShutdownHooks();
  app.enableCors({
    origin: [...config.corsOrigins],
    credentials: false,
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  });

  setupOpenApi(app);

  const instance = app.getHttpAdapter().getInstance();
  instance.addHook('onSend', (request, reply, payload, done) => {
    void reply.header(REQUEST_ID_HEADER, request.id);
    done(null, payload);
  });

  return { app, config };
}

export async function bootstrap(
  env: NodeJS.ProcessEnv = process.env,
): Promise<NestFastifyApplication> {
  const { app, config } = await createApp({ env });
  await app.listen(config.port, config.host);
  return app;
}
