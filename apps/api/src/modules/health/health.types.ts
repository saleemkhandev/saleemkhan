import { ApiProperty } from '@nestjs/swagger';

export class HealthResponse {
  @ApiProperty({ enum: ['ok'], example: 'ok' })
  status!: 'ok';

  @ApiProperty({ example: 'developer-platform-api' })
  service!: string;

  @ApiProperty({ example: '0.0.1' })
  version!: string;
}

export class ReadyResponse {
  @ApiProperty({ enum: ['ok'], example: 'ok' })
  status!: 'ok';

  @ApiProperty({
    example: { application: 'ok' },
    description:
      'Named readiness checks. A later persistence milestone can add a database check here.',
  })
  checks!: {
    readonly application: 'ok';
  };
}
