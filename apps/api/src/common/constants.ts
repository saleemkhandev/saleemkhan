export const SERVICE_NAME = 'developer-platform-api';
export const API_VERSION = '0.0.1';
export const GLOBAL_PREFIX = 'v1';
export const REQUEST_ID_HEADER = 'x-request-id';

export const DEFAULT_DEV_CORS_ORIGINS = [
  'http://localhost:4200',
  'http://localhost:4201',
  'http://localhost:3000',
] as const;

export const DEFAULT_PRODUCTION_CORS_ORIGINS = [
  'https://saleemkhan.dev',
] as const;
