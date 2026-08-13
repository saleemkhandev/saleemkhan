const REQUEST_ID_PATTERN = /^[\w.:-]{1,128}$/;

export function resolveRequestId(
  header: string | string[] | undefined,
): string {
  if (typeof header === 'string' && REQUEST_ID_PATTERN.test(header)) {
    return header;
  }

  return crypto.randomUUID();
}
