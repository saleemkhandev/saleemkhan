import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_VERSION } from '../constants.js';

export function setupOpenApi(app: INestApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Developer Platform API')
      .setDescription(
        'Public HTTP API for the Saleem platform. This milestone exposes health, database-aware readiness, and persistence infrastructure. Domain APIs are later.',
      )
      .setVersion(API_VERSION)
      .build(),
  );

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'openapi.json',
  });
}
