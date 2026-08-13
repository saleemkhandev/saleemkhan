import { ApiProperty } from '@nestjs/swagger';

export class HealthResponse {
  @ApiProperty({ enum: ['ok'], example: 'ok' })
  status!: 'ok';

  @ApiProperty({ example: 'developer-platform-api' })
  service!: string;

  @ApiProperty({ example: '0.0.1' })
  version!: string;
}

export class ReadyChecks {
  @ApiProperty({ enum: ['ok'], example: 'ok' })
  application!: 'ok';

  @ApiProperty({ enum: ['ok', 'error'], example: 'ok' })
  database!: 'ok' | 'error';
}

export class ReadyResponse {
  @ApiProperty({ enum: ['ok', 'not_ready'], example: 'ok' })
  status!: 'ok' | 'not_ready';

  @ApiProperty({ type: ReadyChecks })
  checks!: ReadyChecks;
}
