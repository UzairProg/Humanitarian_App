import { ApiResponse, PaginationMeta } from '@al-husseiniya/types';

// ============================================================================
// STRING & SANITIZATION UTILITIES
// ============================================================================

/**
 * Creates URL-friendly slug supporting Latin and Arabic transliteration
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\u0600-\u06FF\-]+/g, '') // Keep alphanumeric, Arabic chars and hyphens
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Masks an email for privacy protection (e.g. u***r@domain.com)
 */
export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

/**
 * Masks phone numbers for privacy protection
 */
export function maskPhone(phone?: string | null): string {
  if (!phone) return '';
  const cleaned = phone.trim();
  if (cleaned.length < 5) return '***';
  return `${cleaned.slice(0, 3)}****${cleaned.slice(-2)}`;
}

// ============================================================================
// PAGINATION UTILITIES
// ============================================================================

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  const safePage = Math.max(1, page);

  return {
    page: safePage,
    limit,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}

// ============================================================================
// API RESPONSE HELPERS
// ============================================================================

export function createSuccessResponse<T>(
  data: T,
  meta?: any,
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  fieldErrors?: Record<string, string[]>,
  requestId?: string,
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      fieldErrors,
      requestId,
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(str: string): boolean {
  return UUID_REGEX.test(str);
}
