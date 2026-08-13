import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';
import { ERROR_CODES } from '../errors/error-response.js';

/**
 * Request-boundary validation for future API modules.
 * Health/ready do not use it yet.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown): unknown {
    const parsed = this.schema.safeParse(value);

    if (parsed.success) {
      return parsed.data;
    }

    throw new BadRequestException({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Request validation failed',
      details: parsed.error.issues.map((issue) => ({
        field:
          issue.path.length > 0 ? issue.path.map(String).join('.') : '(root)',
        message: issue.message,
      })),
    });
  }
}
