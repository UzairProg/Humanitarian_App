export * from '../../models';

import {
  UserSchema,
  RoleSchema,
  PermissionSchema,
  OrganizationSchema,
  OrganizationMemberSchema,
  OrganizationVerificationSchema,
  BusinessSchema,
  BusinessVerificationSchema,
  BusinessParticipationSchema,
  RequestCategorySchema,
  HumanitarianRequestSchema,
  RequestStatusHistorySchema,
  FoodProgramSchema,
  FoodProgramAvailabilitySchema,
  EventSchema,
  EventRegistrationSchema,
  KnowledgeContentSchema,
  ContributorProfileSchema,
  VolunteerProfileSchema,
  VolunteerOpportunitySchema,
  VolunteerApplicationSchema,
  ReportSchema,
  NotificationSchema,
  ImpactRecordSchema,
  AuditLogSchema,
} from '../../models';

export const User = { name: 'User' };
export const Role = { name: 'Role' };
export const Permission = { name: 'Permission' };
export const Organization = { name: 'Organization' };
export const OrganizationMember = { name: 'OrganizationMember' };
export const OrganizationVerification = { name: 'OrganizationVerification' };
export const Business = { name: 'Business' };
export const BusinessVerification = { name: 'BusinessVerification' };
export const BusinessParticipation = { name: 'BusinessParticipation' };
export const RequestCategory = { name: 'RequestCategory' };
export const HumanitarianRequest = { name: 'HumanitarianRequest' };
export const RequestStatusHistory = { name: 'RequestStatusHistory' };
export const FoodProgram = { name: 'FoodProgram' };
export const FoodProgramAvailability = { name: 'FoodProgramAvailability' };
export const Event = { name: 'Event' };
export const EventRegistration = { name: 'EventRegistration' };
export const KnowledgeContent = { name: 'KnowledgeContent' };
export const ContributorProfile = { name: 'ContributorProfile' };
export const ContributorReviewHistory = { name: 'ContributorReviewHistory' };
export const VolunteerProfile = { name: 'VolunteerProfile' };
export const VolunteerOpportunity = { name: 'VolunteerOpportunity' };
export const VolunteerApplication = { name: 'VolunteerApplication' };
export const Report = { name: 'Report' };
export const Notification = { name: 'Notification' };
export const ImpactRecord = { name: 'ImpactRecord' };
export const AuditLog = { name: 'AuditLog' };

export const ALL_MONGOOSE_MODELS = [
  { name: 'User', schema: UserSchema },
  { name: 'Role', schema: RoleSchema },
  { name: 'Permission', schema: PermissionSchema },
  { name: 'Organization', schema: OrganizationSchema },
  { name: 'OrganizationMember', schema: OrganizationMemberSchema },
  { name: 'OrganizationVerification', schema: OrganizationVerificationSchema },
  { name: 'Business', schema: BusinessSchema },
  { name: 'BusinessVerification', schema: BusinessVerificationSchema },
  { name: 'BusinessParticipation', schema: BusinessParticipationSchema },
  { name: 'RequestCategory', schema: RequestCategorySchema },
  { name: 'HumanitarianRequest', schema: HumanitarianRequestSchema },
  { name: 'RequestStatusHistory', schema: RequestStatusHistorySchema },
  { name: 'FoodProgram', schema: FoodProgramSchema },
  { name: 'FoodProgramAvailability', schema: FoodProgramAvailabilitySchema },
  { name: 'Event', schema: EventSchema },
  { name: 'EventRegistration', schema: EventRegistrationSchema },
  { name: 'KnowledgeContent', schema: KnowledgeContentSchema },
  { name: 'ContributorProfile', schema: ContributorProfileSchema },
  { name: 'VolunteerProfile', schema: VolunteerProfileSchema },
  { name: 'VolunteerOpportunity', schema: VolunteerOpportunitySchema },
  { name: 'VolunteerApplication', schema: VolunteerApplicationSchema },
  { name: 'Report', schema: ReportSchema },
  { name: 'Notification', schema: NotificationSchema },
  { name: 'ImpactRecord', schema: ImpactRecordSchema },
  { name: 'AuditLog', schema: AuditLogSchema },
];
