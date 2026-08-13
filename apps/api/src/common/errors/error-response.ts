export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ErrorDetail {
  readonly field: string;
  readonly message: string;
}

export interface ApiErrorBody {
  readonly error: {
    readonly code: ErrorCode | string;
    readonly message: string;
    readonly details?: readonly ErrorDetail[];
  };
  readonly requestId: string;
}

export function codeForHttpStatus(status: number): string {
  if (status === 400) {
    return ERROR_CODES.BAD_REQUEST;
  }

  if (status === 404) {
    return ERROR_CODES.NOT_FOUND;
  }

  if (status >= 500) {
    return ERROR_CODES.INTERNAL_ERROR;
  }

  return `HTTP_${status}`;
}
