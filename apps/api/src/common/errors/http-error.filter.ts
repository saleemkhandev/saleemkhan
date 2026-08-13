import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { resolveRequestId } from '../request-id/request-id.js';
import { REQUEST_ID_HEADER } from '../constants.js';
import {
  ApiErrorBody,
  ERROR_CODES,
  ErrorDetail,
  codeForHttpStatus,
} from './error-response.js';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();
    const requestId = resolveRequestId(
      request.id ?? request.headers[REQUEST_ID_HEADER],
    );

    const { status, code, message, details } = normalizeException(exception);

    if (status >= 500) {
      request.log.error(
        {
          err: exception,
          requestId,
          method: request.method,
          url: request.url,
        },
        'Unhandled API error',
      );
    }

    const body: ApiErrorBody = {
      error: {
        code,
        message,
        ...(details && details.length > 0 ? { details } : {}),
      },
      requestId,
    };

    reply.header(REQUEST_ID_HEADER, requestId);
    void reply.status(status).send(body);
  }
}

function normalizeException(exception: unknown): {
  status: number;
  code: string;
  message: string;
  details?: readonly ErrorDetail[];
} {
  if (exception instanceof ZodError) {
    return {
      status: HttpStatus.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Request validation failed',
      details: zodDetails(exception),
    };
  }

  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const response = exception.getResponse();

    if (isValidationPayload(response)) {
      return {
        status,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: response.message,
        details: response.details,
      };
    }

    return {
      status,
      code: codeForHttpStatus(status),
      message: httpExceptionMessage(response, exception.message),
    };
  }

  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.INTERNAL_ERROR,
    message: 'An unexpected error occurred',
  };
}

function zodDetails(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.map(String).join('.') : '(root)',
    message: issue.message,
  }));
}

function isValidationPayload(
  response: string | object,
): response is { message: string; details: readonly ErrorDetail[] } {
  if (typeof response !== 'object' || response === null) {
    return false;
  }

  const candidate = response as {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };

  return (
    candidate.code === ERROR_CODES.VALIDATION_ERROR &&
    typeof candidate.message === 'string' &&
    Array.isArray(candidate.details)
  );
}

function httpExceptionMessage(
  response: string | object,
  fallback: string,
): string {
  if (typeof response === 'string' && response.length > 0) {
    return response;
  }

  if (typeof response === 'object' && response !== null) {
    const message = (response as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }

    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === 'string')
    ) {
      return message.join('; ');
    }
  }

  return fallback;
}
