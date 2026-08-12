/**
 * Blog Markdown frontmatter + slug validation.
 *
 * Shared by the build-time prepare-content pipeline and its unit tests.
 * Presentation code must not import this module.
 */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const ALLOWED_STATUSES = new Set(['draft', 'published']);

export class ContentValidationError extends Error {
  /**
   * @param {string} relativePath
   * @param {string} message
   * @param {string | undefined} field
   */
  constructor(relativePath, message, field) {
    const fieldLine = field ? `\nField: ${field}` : '';
    super(
      `Blog content validation failed:\n${relativePath}${fieldLine}\nError: ${message}`,
    );
    this.name = 'ContentValidationError';
  }
}

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @param {string} value
 */
export function isValidCalendarDate(value) {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * @param {string} relativePath
 * @param {string} slug
 */
export function assertValidSlug(relativePath, slug) {
  if (!SLUG_PATTERN.test(slug)) {
    throw new ContentValidationError(
      relativePath,
      `Invalid slug "${slug}". Expected pattern ${SLUG_PATTERN}`,
      'slug',
    );
  }
}

/**
 * @param {string} relativePath
 * @param {Record<string, unknown>} data
 * @returns {{
 *   title: string;
 *   description: string;
 *   publishedAt: string;
 *   status: 'draft' | 'published';
 *   tags: string[];
 * }}
 */
export function validateFrontmatter(relativePath, data) {
  if (!isNonEmptyString(data['title'])) {
    throw new ContentValidationError(
      relativePath,
      'Expected a non-empty string',
      'title',
    );
  }

  if (!isNonEmptyString(data['description'])) {
    throw new ContentValidationError(
      relativePath,
      'Expected a non-empty string',
      'description',
    );
  }

  if (!isNonEmptyString(data['publishedAt'])) {
    throw new ContentValidationError(
      relativePath,
      'Expected YYYY-MM-DD',
      'publishedAt',
    );
  }

  const publishedAt = data['publishedAt'].trim();
  if (!isValidCalendarDate(publishedAt)) {
    throw new ContentValidationError(
      relativePath,
      'Expected a valid calendar date in YYYY-MM-DD format',
      'publishedAt',
    );
  }

  if (!isNonEmptyString(data['status'])) {
    throw new ContentValidationError(
      relativePath,
      'Expected "draft" or "published"',
      'status',
    );
  }

  const status = data['status'].trim();
  if (!ALLOWED_STATUSES.has(status)) {
    throw new ContentValidationError(
      relativePath,
      'Expected "draft" or "published"',
      'status',
    );
  }

  /** @type {string[]} */
  let tags = [];
  if (data['tags'] !== undefined) {
    if (!Array.isArray(data['tags'])) {
      throw new ContentValidationError(
        relativePath,
        'Expected an array of strings',
        'tags',
      );
    }

    tags = data['tags'].map((tag, index) => {
      if (typeof tag !== 'string' || tag.trim().length === 0) {
        throw new ContentValidationError(
          relativePath,
          `Tag at index ${index} must be a non-empty string`,
          'tags',
        );
      }

      const normalized = tag.trim();
      if (!TAG_PATTERN.test(normalized)) {
        throw new ContentValidationError(
          relativePath,
          `Tag "${normalized}" must be lowercase kebab-case`,
          'tags',
        );
      }

      return normalized;
    });
  }

  return {
    title: data['title'].trim(),
    description: data['description'].trim(),
    publishedAt,
    status: /** @type {'draft' | 'published'} */ (status),
    tags,
  };
}
