import { PermissionKey, RoleType } from '@al-husseiniya/types';

// ============================================================================
// BRANDING & PRODUCT IDENTITY
// ============================================================================

export const PRODUCT_CONFIG = {
  name: 'Al-Husseiniya',
  workingName: 'Al-Husseiniya',
  version: '1.0.0',
  tagline: 'Year-round humanitarian & community service inspired by the values of Karbala',
  defaultLocale: 'en',
  supportedLocales: ['en', 'ar', 'ur', 'fa'] as const,
  rtlLocales: ['ar', 'ur', 'fa'] as const,
} as const;

// ============================================================================
// ROLE & PERMISSION MATRIX
// ============================================================================

export const ROLE_PERMISSIONS_MAP: Record<RoleType, PermissionKey[]> = {
  [RoleType.INDIVIDUAL]: [
    PermissionKey.REQUEST_CREATE,
    PermissionKey.REQUEST_VIEW,
    PermissionKey.REQUEST_UPDATE,
    PermissionKey.ORGANIZATION_VIEW,
    PermissionKey.REPORT_CREATE,
  ],
  [RoleType.VOLUNTEER]: [
    PermissionKey.REQUEST_VIEW,
    PermissionKey.ORGANIZATION_VIEW,
    PermissionKey.REPORT_CREATE,
  ],
  [RoleType.CONTRIBUTOR]: [
    PermissionKey.REQUEST_VIEW,
    PermissionKey.ORGANIZATION_VIEW,
    PermissionKey.CONTENT_CREATE,
    PermissionKey.CONTENT_EDIT,
    PermissionKey.CONTENT_SUBMIT,
    PermissionKey.CONTRIBUTOR_APPLY,
    PermissionKey.REPORT_CREATE,
  ],
  [RoleType.BUSINESS_ADMIN]: [
    PermissionKey.REQUEST_VIEW,
    PermissionKey.BUSINESS_CREATE,
    PermissionKey.BUSINESS_UPDATE,
    PermissionKey.ORGANIZATION_VIEW,
    PermissionKey.REPORT_CREATE,
  ],
  [RoleType.ORGANIZATION_STAFF]: [
    PermissionKey.REQUEST_VIEW,
    PermissionKey.ORGANIZATION_VIEW,
    PermissionKey.FOOD_CREATE,
    PermissionKey.FOOD_UPDATE,
    PermissionKey.EVENT_CREATE,
    PermissionKey.EVENT_UPDATE,
    PermissionKey.REPORT_CREATE,
  ],
  [RoleType.ORGANIZATION_ADMIN]: [
    PermissionKey.REQUEST_VIEW,
    PermissionKey.REQUEST_UPDATE,
    PermissionKey.ORGANIZATION_CREATE,
    PermissionKey.ORGANIZATION_UPDATE,
    PermissionKey.ORGANIZATION_VIEW,
    PermissionKey.FOOD_CREATE,
    PermissionKey.FOOD_UPDATE,
    PermissionKey.FOOD_MANAGE,
    PermissionKey.EVENT_CREATE,
    PermissionKey.EVENT_UPDATE,
    PermissionKey.EVENT_PUBLISH,
    PermissionKey.REPORT_CREATE,
  ],
  [RoleType.MODERATOR]: [
    PermissionKey.REQUEST_VIEW,
    PermissionKey.REQUEST_UPDATE,
    PermissionKey.ORGANIZATION_VIEW,
    PermissionKey.REPORT_CREATE,
    PermissionKey.REPORT_VIEW,
    PermissionKey.REPORT_RESOLVE,
    PermissionKey.CONTENT_EDIT,
    PermissionKey.CONTENT_PUBLISH,
    PermissionKey.USER_VIEW,
  ],
  [RoleType.ADMIN]: [
    PermissionKey.REQUEST_CREATE,
    PermissionKey.REQUEST_VIEW,
    PermissionKey.REQUEST_UPDATE,
    PermissionKey.REQUEST_DELETE,
    PermissionKey.ORGANIZATION_CREATE,
    PermissionKey.ORGANIZATION_UPDATE,
    PermissionKey.ORGANIZATION_VIEW,
    PermissionKey.ORGANIZATION_VERIFY,
    PermissionKey.BUSINESS_CREATE,
    PermissionKey.BUSINESS_UPDATE,
    PermissionKey.BUSINESS_VERIFY,
    PermissionKey.FOOD_CREATE,
    PermissionKey.FOOD_UPDATE,
    PermissionKey.FOOD_MANAGE,
    PermissionKey.EVENT_CREATE,
    PermissionKey.EVENT_UPDATE,
    PermissionKey.EVENT_PUBLISH,
    PermissionKey.CONTENT_CREATE,
    PermissionKey.CONTENT_EDIT,
    PermissionKey.CONTENT_SUBMIT,
    PermissionKey.CONTENT_PUBLISH,
    PermissionKey.CONTRIBUTOR_APPLY,
    PermissionKey.CONTRIBUTOR_REVIEW,
    PermissionKey.REPORT_CREATE,
    PermissionKey.REPORT_VIEW,
    PermissionKey.REPORT_RESOLVE,
    PermissionKey.USER_VIEW,
    PermissionKey.USER_MANAGE,
    PermissionKey.USER_SUSPEND,
    PermissionKey.AUDIT_VIEW,
  ],
  [RoleType.SUPER_ADMIN]: Object.values(PermissionKey),
};

// ============================================================================
// SYSTEM & SECURITY LIMITS
// ============================================================================

export const SECURITY_CONFIG = {
  bcryptSaltRounds: 12,
  passwordMinLength: 8,
  accessTokenExpiresInSeconds: 900, // 15 mins
  refreshTokenExpiresInSeconds: 604800, // 7 days
  maxUploadSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedUploadMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ] as const,
  rateLimit: {
    ttlSeconds: 60,
    maxRequests: 100,
    authMaxRequests: 10, // stricter for login/register
  },
};

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

export const PAGINATION_DEFAULTS = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1,
} as const;
