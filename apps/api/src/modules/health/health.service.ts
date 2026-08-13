import { Injectable } from '@nestjs/common';
import { API_VERSION, SERVICE_NAME } from '../../common/constants.js';
import { HealthResponse, ReadyResponse } from './health.types.js';

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: SERVICE_NAME,
      version: API_VERSION,
    };
  }

  /**
   * Readiness for this milestone means the Nest/Fastify application
   * initialized and can serve requests. There is no database yet.
   * A later persistence PR can add a `database` check beside `application`.
   */
  getReadiness(): ReadyResponse {
    return {
      status: 'ok',
      checks: {
        application: 'ok',
      },
    };
  }
}
