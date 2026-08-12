/**
 * Formats article `publishedAt` (`YYYY-MM-DD`) for display using UTC calendar date.
 */
export function formatArticleDate(publishedAt: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(publishedAt);
  if (!match) {
    return publishedAt;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
