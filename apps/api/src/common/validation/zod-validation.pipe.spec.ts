import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ERROR_CODES } from '../errors/error-response.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(
    z.object({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    }),
  );

  it('returns parsed data for a valid payload', () => {
    const result = pipe.transform({ slug: 'saleemkhan-platform' }) as {
      slug: string;
    };
    assert.equal(result.slug, 'saleemkhan-platform');
  });

  it('throws a validation error envelope for an invalid payload', () => {
    try {
      pipe.transform({ slug: 'Not Valid' });
      assert.fail('expected BadRequestException');
    } catch (error) {
      assert.ok(error instanceof BadRequestException);
      assert.equal(error.getStatus(), 400);
      const body = error.getResponse() as {
        code: string;
        message: string;
        details: ReadonlyArray<{ field: string; message: string }>;
      };
      assert.equal(body.code, ERROR_CODES.VALIDATION_ERROR);
      assert.equal(body.message, 'Request validation failed');
      assert.ok(body.details.length > 0);
      assert.equal(body.details[0]?.field, 'slug');
    }
  });
});
