export * from './user.schema';
export * from './role.schema';
export * from './permission.schema';
export * from './organization.schema';
export * from './organization-member.schema';
export * from './organization-verification.schema';
export * from './business.schema';
export * from './business-verification.schema';
export * from './request-category.schema';
export * from './humanitarian-request.schema';
export * from './request-status-history.schema';
export * from './food-program.schema';
export * from './food-program-availability.schema';
export * from './event.schema';
export * from './knowledge-content.schema';
export * from './contributor-profile.schema';
export * from './contributor-review-history.schema';
export * from './volunteer-profile.schema';
export * from './volunteer-opportunity.schema';
export * from './report.schema';
export * from './notification.schema';
export * from './impact-record.schema';
export * from './audit-log.schema';

import { User, UserSchema } from './user.schema';
import { Role, RoleSchema } from './role.schema';
import { Permission, PermissionSchema } from './permission.schema';
import { Organization, OrganizationSchema } from './organization.schema';
import { OrganizationMember, OrganizationMemberSchema } from './organization-member.schema';
import { OrganizationVerification, OrganizationVerificationSchema } from './organization-verification.schema';
import { Business, BusinessSchema } from './business.schema';
import { BusinessVerification, BusinessVerificationSchema } from './business-verification.schema';
import { RequestCategory, RequestCategorySchema } from './request-category.schema';
import { HumanitarianRequest, HumanitarianRequestSchema } from './humanitarian-request.schema';
import { RequestStatusHistory, RequestStatusHistorySchema } from './request-status-history.schema';
import { FoodProgram, FoodProgramSchema } from './food-program.schema';
import { FoodProgramAvailability, FoodProgramAvailabilitySchema } from './food-program-availability.schema';
import { Event, EventSchema } from './event.schema';
import { KnowledgeContent, KnowledgeContentSchema } from './knowledge-content.schema';
import { ContributorProfile, ContributorProfileSchema } from './contributor-profile.schema';
import { ContributorReviewHistory, ContributorReviewHistorySchema } from './contributor-review-history.schema';
import { VolunteerProfile, VolunteerProfileSchema } from './volunteer-profile.schema';
import { VolunteerOpportunity, VolunteerOpportunitySchema } from './volunteer-opportunity.schema';
import { Report, ReportSchema } from './report.schema';
import { Notification, NotificationSchema } from './notification.schema';
import { ImpactRecord, ImpactRecordSchema } from './impact-record.schema';
import { AuditLog, AuditLogSchema } from './audit-log.schema';

export const ALL_MONGOOSE_MODELS = [
  { name: User.name, schema: UserSchema },
  { name: Role.name, schema: RoleSchema },
  { name: Permission.name, schema: PermissionSchema },
  { name: Organization.name, schema: OrganizationSchema },
  { name: OrganizationMember.name, schema: OrganizationMemberSchema },
  { name: OrganizationVerification.name, schema: OrganizationVerificationSchema },
  { name: Business.name, schema: BusinessSchema },
  { name: BusinessVerification.name, schema: BusinessVerificationSchema },
  { name: RequestCategory.name, schema: RequestCategorySchema },
  { name: HumanitarianRequest.name, schema: HumanitarianRequestSchema },
  { name: RequestStatusHistory.name, schema: RequestStatusHistorySchema },
  { name: FoodProgram.name, schema: FoodProgramSchema },
  { name: FoodProgramAvailability.name, schema: FoodProgramAvailabilitySchema },
  { name: Event.name, schema: EventSchema },
  { name: KnowledgeContent.name, schema: KnowledgeContentSchema },
  { name: ContributorProfile.name, schema: ContributorProfileSchema },
  { name: ContributorReviewHistory.name, schema: ContributorReviewHistorySchema },
  { name: VolunteerProfile.name, schema: VolunteerProfileSchema },
  { name: VolunteerOpportunity.name, schema: VolunteerOpportunitySchema },
  { name: Report.name, schema: ReportSchema },
  { name: Notification.name, schema: NotificationSchema },
  { name: ImpactRecord.name, schema: ImpactRecordSchema },
  { name: AuditLog.name, schema: AuditLogSchema },
];
