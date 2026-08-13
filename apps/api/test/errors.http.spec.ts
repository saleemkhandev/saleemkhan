import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { Controller, Get, Module } from '@nestjs/common';
import { APP_FILTER, NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { HttpErrorFilter } from '../src/common/errors/http-error.filter.js';
import { ERROR_CODES } from '../src/common/errors/error-response.js';
import { REQUEST_ID_HEADER } from '../src/common/constants.js';
import { ZodValidationPipe } from '../src/common/validation/zod-validation.pipe.js';
import { z } from 'zod';
import { createTestApp, inject } from './app-test.helper.js';

@Controller()
class BoomController {
  @Get('boom')
  boom(): never {
    throw new Error('internal secret');
  }

  @Get('validate')
  validate(): unknown {
    return new ZodValidationPipe(
      z.object({ slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) }),
    ).transform({ slug: 'Not Valid' });
  }
}

@Module({
  controllers: [BoomController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
  ],
})
class BoomModule {}

describe('HTTP error responses', () => {
  let app: NestFastifyApplication;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
  });

  it('returns a JSON 404 envelope with a request id', async () => {
    const response = await inject(app, {
      method: 'GET',
      url: '/v1/does-not-exist',
    });
    const body = response.json() as {
      error: { code: string; message: string; stack?: string };
      requestId: string;
      stack?: string;
    };

    assert.equal(response.statusCode, 404);
    assert.equal(body.error.code, ERROR_CODES.NOT_FOUND);
    assert.equal(typeof body.error.message, 'string');
    assert.equal(typeof body.requestId, 'string');
    assert.ok(body.requestId.length > 0);
    assert.equal(body.error.stack, undefined);
    assert.equal(body.stack, undefined);
    assert.equal(response.headers[REQUEST_ID_HEADER], body.requestId);
  });
});

describe('unexpected errors', () => {
  let app: NestFastifyApplication;

  before(async () => {
    const adapter = new FastifyAdapter({ logger: false });
    app = await NestFactory.create<NestFastifyApplication>(
      BoomModule,
      adapter,
      { logger: false },
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  after(async () => {
    await app.close();
  });

  it('hides internal messages and stack traces', async () => {
    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/boom',
    });
    const payload = response.payload;
    const body = response.json() as {
      error: { code: string; message: string };
      requestId: string;
    };

    assert.equal(response.statusCode, 500);
    assert.equal(body.error.code, ERROR_CODES.INTERNAL_ERROR);
    assert.equal(body.error.message, 'An unexpected error occurred');
    assert.equal(payload.includes('internal secret'), false);
    assert.equal(payload.includes('at '), false);
    assert.equal(typeof body.requestId, 'string');
  });

  it('maps validation failures to a 400 envelope', async () => {
    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/validate',
    });
    const body = response.json() as {
      error: {
        code: string;
        message: string;
        details: ReadonlyArray<{ field: string }>;
      };
      requestId: string;
    };

    assert.equal(response.statusCode, 400);
    assert.equal(body.error.code, ERROR_CODES.VALIDATION_ERROR);
    assert.equal(body.error.message, 'Request validation failed');
    assert.ok(body.error.details?.some((detail) => detail.field === 'slug'));
  });
});
