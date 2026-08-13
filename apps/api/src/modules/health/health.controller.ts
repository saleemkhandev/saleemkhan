import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service.js';
import { HealthResponse, ReadyResponse } from './health.types.js';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Process health',
    description:
      'Returns whether the API process is up. Does not check a database.',
  })
  @ApiOkResponse({ type: HealthResponse })
  getHealth(): HealthResponse {
    return this.health.getHealth();
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Application readiness',
    description:
      'Returns whether the API has initialized and can serve requests. No database check in this milestone.',
  })
  @ApiOkResponse({ type: ReadyResponse })
  getReady(): ReadyResponse {
    return this.health.getReadiness();
  }
}
