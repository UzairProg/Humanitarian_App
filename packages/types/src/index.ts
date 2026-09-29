/**
 * Al-Husseiniya — Shared Types & Domain Contracts
 * Modular Monolith Type System
 */

// ============================================================================
// 1. ROLES & PERMISSIONS
// ============================================================================

export enum RoleType {
  INDIVIDUAL = 'INDIVIDUAL',
  ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN',
  ORGANIZATION_STAFF = 'ORGANIZATION_STAFF',
  COMMUNITY_ADMIN = 'COMMUNITY_ADMIN',
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',
  VOLUNTEER = 'VOLUNTEER',
  BENEFICIARY = 'BENEFICIARY',
  PUBLIC_USER = 'PUBLIC_USER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum PermissionKey {
  // Requests
  REQUEST_CREATE = 'request:create',
  REQUEST_VIEW = 'request:view',
  REQUEST_UPDATE = 'request:update',
  REQUEST_DELETE = 'request:delete',

  // Organizations
  ORGANIZATION_CREATE = 'organization:create',
  ORGANIZATION_UPDATE = 'organization:update',
  ORGANIZATION_VIEW = 'organization:view',
  ORGANIZATION_VERIFY = 'organization:verify',

  // Businesses
  BUSINESS_CREATE = 'business:create',
  BUSINESS_UPDATE = 'business:update',
  BUSINESS_VERIFY = 'business:verify',

  // Food Programs
  FOOD_CREATE = 'food:create',
  FOOD_UPDATE = 'food:update',
  FOOD_MANAGE = 'food:manage',

  // Events
  EVENT_CREATE = 'event:create',
  EVENT_UPDATE = 'event:update',
  EVENT_PUBLISH = 'event:publish',

  // Knowledge & Content
  CONTENT_CREATE = 'content:create',
  CONTENT_EDIT = 'content:edit',
  CONTENT_SUBMIT = 'content:submit',
  CONTENT_PUBLISH = 'content:publish',

  // Contributors
  CONTRIBUTOR_APPLY = 'contributor:apply',
  CONTRIBUTOR_REVIEW = 'contributor:review',

  // Reports & Moderation
  REPORT_CREATE = 'report:create',
  REPORT_VIEW = 'report:view',
  REPORT_RESOLVE = 'report:resolve',

  // Users & Administration
  USER_VIEW = 'user:view',
  USER_MANAGE = 'user:manage',
  USER_SUSPEND = 'user:suspend',

  // Audit
  AUDIT_VIEW = 'audit:view',
}

// ============================================================================
// 2. ENUMS & DOMAIN STATUSES
// ============================================================================

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum RequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  IN_REVIEW = 'IN_REVIEW',
  MATCHED = 'MATCHED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
}

export enum RequestPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ProgramStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  OPEN = 'OPEN',
  LIMITED = 'LIMITED',
  FULL = 'FULL',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum ContributorType {
  SCHOLAR = 'SCHOLAR',
  PREACHER = 'PREACHER',
  RESEARCHER = 'RESEARCHER',
  COMMUNITY_EDUCATOR = 'COMMUNITY_EDUCATOR',
  ACADEMIC = 'ACADEMIC',
}

export enum ContributorReviewStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_ADMIN_REVIEW = 'UNDER_ADMIN_REVIEW',
  UNDER_SPECIALIST_REVIEW = 'UNDER_SPECIALIST_REVIEW',
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  REJECTED = 'REJECTED',
}

export enum ContentPublicationStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED',
}

export enum ReportTargetType {
  USER = 'USER',
  ORGANIZATION = 'ORGANIZATION',
  BUSINESS = 'BUSINESS',
  REQUEST = 'REQUEST',
  CONTENT = 'CONTENT',
  EVENT = 'EVENT',
}

export enum ReportStatus {
  SUBMITTED = 'SUBMITTED',
  IN_INVESTIGATION = 'IN_INVESTIGATION',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VERIFY = 'VERIFY',
  REJECT = 'REJECT',
  ASSIGN_ROLE = 'ASSIGN_ROLE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

export enum MetricType {
  MEALS_DISTRIBUTED = 'MEALS_DISTRIBUTED',
  REQUESTS_FULFILLED = 'REQUESTS_FULFILLED',
  VOLUNTEER_HOURS = 'VOLUNTEER_HOURS',
  PEOPLE_SERVED = 'PEOPLE_SERVED',
  EVENTS_HOSTED = 'EVENTS_HOSTED',
}

// ============================================================================
// 3. CORE ENTITY INTERFACES
// ============================================================================

export interface IUser {
  id: string;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  locale: string;
  timezone: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatarUrl?: string | null;
  roles: RoleType[];
  role?: string | RoleType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IRole {
  id: string;
  name: RoleType;
  description: string;
  isSystem: boolean;
}

export interface IPermission {
  id: string;
  key: PermissionKey;
  description: string;
}

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string | null;
  location: string;
  contactEmail: string;
  contactPhone?: string | null;
  status: string;
  verificationStatus: VerificationStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: Date;
}

export interface IOrganizationVerification {
  id: string;
  organizationId: string;
  status: VerificationStatus;
  reviewerId?: string | null;
  decision?: string | null;
  notes?: string | null;
  submittedAt: Date;
  reviewedAt?: Date | null;
}

export interface IBusiness {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone?: string | null;
  status: string;
  verificationStatus: VerificationStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBusinessVerification {
  id: string;
  businessId: string;
  status: VerificationStatus;
  reviewerId?: string | null;
  decision?: string | null;
  notes?: string | null;
  submittedAt: Date;
  reviewedAt?: Date | null;
}

export interface IRequestCategory {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  isActive: boolean;
}

export interface IHumanitarianRequest {
  id: string;
  requesterId: string;
  categoryId: string;
  title: string;
  description: string;
  location: string;
  status: RequestStatus;
  priority: RequestPriority;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequestStatusHistory {
  id: string;
  requestId: string;
  previousStatus: RequestStatus;
  newStatus: RequestStatus;
  changedById: string;
  reason?: string | null;
  timestamp: Date;
}

export interface IFoodProgram {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  location: string;
  programDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  remainingCapacity: number;
  status: ProgramStatus;
  instructions?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvent {
  id: string;
  organizerId: string;
  organizationId?: string | null;
  title: string;
  description: string;
  location: string;
  startAt: Date;
  endAt: Date;
  category: string;
  status: string;
  mediaUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IKnowledgeContent {
  id: string;
  title: string;
  summary: string;
  body: string;
  mediaUrl?: string | null;
  contributorId: string;
  category: string;
  language: string;
  reviewStatus: ContributorReviewStatus;
  publicationStatus: ContentPublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContributorProfile {
  id: string;
  userId: string;
  contributorType: ContributorType;
  biography: string;
  credentialsMetadata?: Record<string, any> | null;
  verificationStatus: VerificationStatus;
  reviewStatus: ContributorReviewStatus;
  visibility: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVolunteerProfile {
  id: string;
  userId: string;
  skills: string[];
  interests: string[];
  availability: string;
  location: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVolunteerOpportunity {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  location: string;
  startAt: Date;
  endAt: Date;
  requirements: string[];
  capacity: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReport {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string;
  evidenceUrl?: string | null;
  status: ReportStatus;
  assignedReviewerId?: string | null;
  resolution?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  message?: string;
  isRead?: boolean;
  payload?: Record<string, any> | null;
  readAt?: Date | null;
  createdAt: Date;
}

export interface IImpactRecord {
  id: string;
  entityType: string;
  entityId: string;
  metricType: MetricType;
  value: number;
  source: string;
  timestamp: Date;
}

export interface IAuditLog {
  id: string;
  actorId?: string | null;
  action: AuditAction | string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any> | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  timestamp: Date;
}

// ============================================================================
// 4. API, PAGINATION & ERROR CONTRACTS
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  meta?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
}

export interface ResponseMetadata {
  requestId?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

// ============================================================================
// 5. AUTH CONTRACTS
// ============================================================================

export interface JwtPayload {
  sub: string;
  email: string;
  roles: RoleType[];
  permissions: PermissionKey[];
  orgId?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSession {
  user: Omit<IUser, 'passwordHash'>;
  roles: RoleType[];
  permissions: PermissionKey[];
  tokens: AuthTokens;
}

// Convenient type aliases
export type User = IUser;
export type Role = IRole;
export type Permission = IPermission;
export type Organization = IOrganization;
export type OrganizationMember = IOrganizationMember;
export type OrganizationVerification = IOrganizationVerification;
export type Business = IBusiness;
export type BusinessVerification = IBusinessVerification;
export type RequestCategory = IRequestCategory;
export type HumanitarianRequest = IHumanitarianRequest;
export type RequestStatusHistory = IRequestStatusHistory;
export type FoodProgram = IFoodProgram;
export type Event = IEvent;
export type KnowledgeContent = IKnowledgeContent;
export type ContributorProfile = IContributorProfile;
export type VolunteerProfile = IVolunteerProfile;
export type VolunteerOpportunity = IVolunteerOpportunity;
export type Report = IReport;
export type Notification = INotification;
export type ImpactRecord = IImpactRecord;
export type AuditLog = IAuditLog;

