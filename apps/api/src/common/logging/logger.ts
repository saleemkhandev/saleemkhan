import type { FastifyServerOptions } from 'fastify';
import type { AppConfig } from '../../config/configuration.js';

export function createFastifyLoggerOptions(
  config: AppConfig,
): FastifyServerOptions['logger'] {
  return {
    level: config.logLevel,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["set-cookie"]',
        '*.DATABASE_URL',
        '*.password',
        '*.secret',
      ],
      censor: '[Redacted]',
    },
    serializers: {
      req(request: { method?: string; url?: string; id?: string }) {
        return {
          method: request.method,
          url: request.url,
          requestId: request.id,
        };
      },
    },
  };
}
