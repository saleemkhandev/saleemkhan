import { Injectable } from '@nestjs/common';
import { API_VERSION, SERVICE_NAME } from '../../common/constants.js';
import { DatabaseService } from '../../database/database.service.js';
import { HealthResponse, ReadyResponse } from './health.types.js';

@Injectable()
export class HealthService {
  constructor(private readonly database: DatabaseService) {}

  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: SERVICE_NAME,
      version: API_VERSION,
    };
  }

  /**
   * Process health is independent of PostgreSQL.
   * Readiness requires a lightweight database connectivity check.
   */
  async getReadiness(): Promise<ReadyResponse> {
    const databaseOk = await this.database.ping();

    return {
      status: databaseOk ? 'ok' : 'not_ready',
      checks: {
        application: 'ok',
        database: databaseOk ? 'ok' : 'error',
      },
    };
  }
}
