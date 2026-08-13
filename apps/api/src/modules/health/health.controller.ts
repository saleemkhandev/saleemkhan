import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
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
      'Returns whether the API process is up. Does not check PostgreSQL.',
  })
  @ApiOkResponse({ type: HealthResponse })
  getHealth(): HealthResponse {
    return this.health.getHealth();
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Application readiness',
    description:
      'Returns whether the API can serve traffic and reach PostgreSQL. Health remains process-only.',
  })
  @ApiOkResponse({ type: ReadyResponse })
  @ApiResponse({ status: HttpStatus.SERVICE_UNAVAILABLE, type: ReadyResponse })
  async getReady(@Res() reply: FastifyReply): Promise<void> {
    const body = await this.health.getReadiness();
    const status =
      body.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    await reply.status(status).send(body);
  }
}
