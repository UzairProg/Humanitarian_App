import mongoose, { Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import {
  RoleType,
  UserStatus,
  VerificationStatus,
  RequestStatus,
  RequestPriority,
  ProgramStatus,
  ContributorType,
  ContributorReviewStatus,
  ContentPublicationStatus,
  ReportTargetType,
  ReportStatus,
  MetricType,
  AuditAction,
} from '@al-husseiniya/types';
import { ROLE_PERMISSIONS_MAP, SECURITY_CONFIG } from '@al-husseiniya/config';
import {
  User,
  UserSchema,
  Role,
  RoleSchema,
  Permission,
  PermissionSchema,
  Organization,
  OrganizationSchema,
  OrganizationMember,
  OrganizationMemberSchema,
  OrganizationVerification,
  OrganizationVerificationSchema,
  Business,
  BusinessSchema,
  RequestCategory,
  RequestCategorySchema,
  HumanitarianRequest,
  HumanitarianRequestSchema,
  RequestStatusHistory,
  RequestStatusHistorySchema,
  FoodProgram,
  FoodProgramSchema,
  FoodProgramAvailability,
  FoodProgramAvailabilitySchema,
  Event,
  EventSchema,
  EventRegistration,
  EventRegistrationSchema,
  KnowledgeContent,
  KnowledgeContentSchema,
  ContributorProfile,
  ContributorProfileSchema,
  VolunteerProfile,
  VolunteerProfileSchema,
  VolunteerOpportunity,
  VolunteerOpportunitySchema,
  VolunteerApplication,
  VolunteerApplicationSchema,
  Report,
  ReportSchema,
  Notification,
  NotificationSchema,
  ImpactRecord,
  ImpactRecordSchema,
  AuditLog,
  AuditLogSchema,
  Company,
  CompanySchema,
  CompanyProduct,
  CompanyProductSchema,
} from '../schemas';

export interface DemoSeedCounts {
  users: number;
  organizations: number;
  foodPrograms: number;
  requests: number;
  events: number;
  volunteers: number;
  businesses: number;
  knowledgeArticles: number;
  contributors: number;
  notifications: number;
  reports: number;
}

/**
 * Model retriever helper ensuring schema compilation compatibility
 */
function getModel<T>(conn: Connection, name: string, schema: any): mongoose.Model<any> {
  return (conn.models[name] || conn.model(name, schema)) as mongoose.Model<any>;
}

/**
 * Safely resets ONLY records tagged with isDemo: true.
 * NEVER deletes non-demo or production data.
 */
export async function runDemoReset(connection: Connection): Promise<DemoSeedCounts> {
  console.log('[DemoReset] Removing existing demo dataset (isDemo: true only)...');

  const UserModel = getModel(connection, User.name, UserSchema);
  const OrgModel = getModel(connection, Organization.name, OrganizationSchema);
  const MemberModel = getModel(connection, OrganizationMember.name, OrganizationMemberSchema);
  const OrgVerifModel = getModel(connection, OrganizationVerification.name, OrganizationVerificationSchema);
  const FoodModel = getModel(connection, FoodProgram.name, FoodProgramSchema);
  const FoodAvailModel = getModel(connection, FoodProgramAvailability.name, FoodProgramAvailabilitySchema);
  const RequestModel = getModel(connection, HumanitarianRequest.name, HumanitarianRequestSchema);
  const RequestHistModel = getModel(connection, RequestStatusHistory.name, RequestStatusHistorySchema);
  const EventModel = getModel(connection, Event.name, EventSchema);
  const EventRegModel = getModel(connection, EventRegistration.name, EventRegistrationSchema);
  const KnowledgeModel = getModel(connection, KnowledgeContent.name, KnowledgeContentSchema);
  const ContribModel = getModel(connection, ContributorProfile.name, ContributorProfileSchema);
  const VolProfileModel = getModel(connection, VolunteerProfile.name, VolunteerProfileSchema);
  const VolOppModel = getModel(connection, VolunteerOpportunity.name, VolunteerOpportunitySchema);
  const VolAppModel = getModel(connection, VolunteerApplication.name, VolunteerApplicationSchema);
  const BizModel = getModel(connection, Business.name, BusinessSchema);
  const ReportModel = getModel(connection, Report.name, ReportSchema);
  const NotificationModel = getModel(connection, Notification.name, NotificationSchema);
  const ImpactModel = getModel(connection, ImpactRecord.name, ImpactRecordSchema);
  const AuditModel = getModel(connection, AuditLog.name, AuditLogSchema);

  // Strictly target records with isDemo: true
  await Promise.all([
    UserModel.deleteMany({ isDemo: true }),
    OrgModel.deleteMany({ isDemo: true }),
    MemberModel.deleteMany({ isDemo: true }),
    OrgVerifModel.deleteMany({ isDemo: true }),
    FoodModel.deleteMany({ isDemo: true }),
    FoodAvailModel.deleteMany({ isDemo: true }),
    RequestModel.deleteMany({ isDemo: true }),
    RequestHistModel.deleteMany({ isDemo: true }),
    EventModel.deleteMany({ isDemo: true }),
    EventRegModel.deleteMany({ isDemo: true }),
    KnowledgeModel.deleteMany({ isDemo: true }),
    ContribModel.deleteMany({ isDemo: true }),
    VolProfileModel.deleteMany({ isDemo: true }),
    VolOppModel.deleteMany({ isDemo: true }),
    VolAppModel.deleteMany({ isDemo: true }),
    BizModel.deleteMany({ isDemo: true }),
    ReportModel.deleteMany({ isDemo: true }),
    NotificationModel.deleteMany({ isDemo: true }),
    ImpactModel.deleteMany({ isDemo: true }),
    AuditModel.deleteMany({ isDemo: true }),
  ]);

  console.log('[DemoReset] Existing demo records safely removed. Reseeding demo dataset...');
  const counts = await runDemoSeed(connection);

  console.log('\nDemo dataset reset.');
  console.log(`Users: ${counts.users}`);
  console.log(`Organizations: ${counts.organizations}`);
  console.log(`Food programs: ${counts.foodPrograms}`);
  console.log(`Requests: ${counts.requests}`);
  console.log(`Events: ${counts.events}`);
  console.log(`Knowledge articles: ${counts.knowledgeArticles}`);
  console.log(`Businesses: ${counts.businesses}`);
  console.log(`Volunteers: ${counts.volunteers}`);
  console.log(`Notifications: ${counts.notifications}`);
  console.log(`Reports: ${counts.reports}\n`);

  return counts;
}

/**
 * Idempotently populates the comprehensive CEO demonstration dataset.
 */
export async function runDemoSeed(connection: Connection): Promise<DemoSeedCounts> {
  const UserModel = getModel(connection, User.name, UserSchema);
  const RoleModel = getModel(connection, Role.name, RoleSchema);
  const PermissionModel = getModel(connection, Permission.name, PermissionSchema);
  const OrgModel = getModel(connection, Organization.name, OrganizationSchema);
  const MemberModel = getModel(connection, OrganizationMember.name, OrganizationMemberSchema);
  const OrgVerifModel = getModel(connection, OrganizationVerification.name, OrganizationVerificationSchema);
  const BizModel = getModel(connection, Business.name, BusinessSchema);
  const CategoryModel = getModel(connection, RequestCategory.name, RequestCategorySchema);
  const RequestModel = getModel(connection, HumanitarianRequest.name, HumanitarianRequestSchema);
  const RequestHistModel = getModel(connection, RequestStatusHistory.name, RequestStatusHistorySchema);
  const FoodModel = getModel(connection, FoodProgram.name, FoodProgramSchema);
  const FoodAvailModel = getModel(connection, FoodProgramAvailability.name, FoodProgramAvailabilitySchema);
  const EventModel = getModel(connection, Event.name, EventSchema);
  const EventRegModel = getModel(connection, EventRegistration.name, EventRegistrationSchema);
  const KnowledgeModel = getModel(connection, KnowledgeContent.name, KnowledgeContentSchema);
  const ContribModel = getModel(connection, ContributorProfile.name, ContributorProfileSchema);
  const VolProfileModel = getModel(connection, VolunteerProfile.name, VolunteerProfileSchema);
  const VolOppModel = getModel(connection, VolunteerOpportunity.name, VolunteerOpportunitySchema);
  const VolAppModel = getModel(connection, VolunteerApplication.name, VolunteerApplicationSchema);
  const ReportModel = getModel(connection, Report.name, ReportSchema);
  const NotificationModel = getModel(connection, Notification.name, NotificationSchema);
  const ImpactModel = getModel(connection, ImpactRecord.name, ImpactRecordSchema);
  const AuditModel = getModel(connection, AuditLog.name, AuditLogSchema);
  const CompanyModel = getModel(connection, Company.name, CompanySchema);
  const ProductModel = getModel(connection, CompanyProduct.name, CompanyProductSchema);

  // 1. Roles and Permissions baseline
  const allPermissions = new Set<string>();
  Object.values(ROLE_PERMISSIONS_MAP).forEach((perms) => {
    perms.forEach((p) => allPermissions.add(p));
  });

  for (const permKey of allPermissions) {
    await PermissionModel.updateOne(
      { key: permKey },
      { $setOnInsert: { key: permKey, description: `Allows action ${permKey}` } },
      { upsert: true },
    );
  }

  for (const roleType of Object.values(RoleType)) {
    const assignedPerms = ROLE_PERMISSIONS_MAP[roleType] || [];
    await RoleModel.updateOne(
      { name: roleType },
      {
        $setOnInsert: {
          name: roleType,
          description: `Standard system role for ${roleType}`,
          isSystem: true,
          permissions: assignedPerms,
        },
      },
      { upsert: true },
    );
  }

  // 2. Request Categories baseline
  const categories = [
    { code: 'FOOD_ASSISTANCE', nameEn: 'Food Assistance', nameAr: 'المساعدات الغذائية' },
    { code: 'WINTER_RELIEF', nameEn: 'Winterization & Blankets', nameAr: 'مساعدات الشتاء والكسوة' },
    { code: 'MEDICAL_SUPPORT', nameEn: 'Emergency Medical Support', nameAr: 'الدعم الطبي الطارئ' },
    { code: 'ORPHAN_FAMILY', nameEn: 'Orphan & Family Sponsorship', nameAr: 'كفالة الأيتام والأسر' },
    { code: 'COMMUNITY_SERVICE', nameEn: 'Community Service & Transport', nameAr: 'الخدمة المجتمعية والنقل' },
  ];

  const createdCategories: Record<string, any> = {};
  for (const cat of categories) {
    let existing = await CategoryModel.findOne({ code: cat.code });
    if (!existing) {
      existing = await CategoryModel.create({
        ...cat,
        descriptionEn: `Community assistance category for ${cat.nameEn}`,
        descriptionAr: `فئة الخدمة المجتمعية لـ ${cat.nameAr}`,
        isActive: true,
      });
    }
    createdCategories[cat.code] = existing;
  }

  // 3. Demo Accounts (Password: DemoPass@12345)
  // DEMO ONLY — NEVER USE IN PRODUCTION
  const demoPassword = 'DemoPass@12345';
  const demoPasswordHash = await bcrypt.hash(demoPassword, SECURITY_CONFIG.bcryptSaltRounds || 10);

  const demoUsersConfig = [
    {
      email: 'demo.admin@demo.alhusseiniya.app',
      firstName: 'Demo',
      lastName: 'Administrator',
      roles: [RoleType.SUPER_ADMIN, RoleType.ADMIN],
      locale: 'en',
    },
    {
      email: 'demo.moderator@demo.alhusseiniya.app',
      firstName: 'Demo',
      lastName: 'Moderator',
      roles: [RoleType.MODERATOR],
      locale: 'ar',
    },
    {
      email: 'demo.organization@demo.alhusseiniya.app',
      firstName: 'Hassan',
      lastName: 'Ali',
      roles: [RoleType.ORGANIZATION_ADMIN, RoleType.INDIVIDUAL],
      locale: 'ar',
    },
    {
      email: 'demo.requester@demo.alhusseiniya.app',
      firstName: 'Omar',
      lastName: 'Kareem',
      roles: [RoleType.INDIVIDUAL, RoleType.BENEFICIARY],
      locale: 'ar',
    },
    {
      email: 'demo.individual@demo.alhusseiniya.app',
      firstName: 'Amina',
      lastName: 'Hassan',
      roles: [RoleType.INDIVIDUAL],
      locale: 'en',
    },
    {
      email: 'demo.volunteer@demo.alhusseiniya.app',
      firstName: 'Zainab',
      lastName: 'Noor',
      roles: [RoleType.VOLUNTEER, RoleType.INDIVIDUAL],
      locale: 'ar',
    },
    {
      email: 'demo.business@demo.alhusseiniya.app',
      firstName: 'Karim',
      lastName: 'Ahmad',
      roles: [RoleType.BUSINESS_ADMIN, RoleType.INDIVIDUAL],
      locale: 'en',
    },
    {
      email: 'demo.contributor@demo.alhusseiniya.app',
      firstName: 'Mahdi',
      lastName: 'Rahman',
      roles: [RoleType.CONTRIBUTOR, RoleType.INDIVIDUAL],
      locale: 'ar',
    },
    {
      email: 'demo.contributor2@demo.alhusseiniya.app',
      firstName: 'Fatima',
      lastName: 'Al-Zahra Demo',
      roles: [RoleType.CONTRIBUTOR, RoleType.INDIVIDUAL],
      locale: 'en',
    },
    {
      email: 'demo.contributor3@demo.alhusseiniya.app',
      firstName: 'Yusuf',
      lastName: 'Al-Baqir Demo',
      roles: [RoleType.CONTRIBUTOR, RoleType.INDIVIDUAL],
      locale: 'ar',
    },
    {
      email: 'demo.volunteer2@demo.alhusseiniya.app',
      firstName: 'Bilal',
      lastName: 'Qasim',
      roles: [RoleType.VOLUNTEER, RoleType.INDIVIDUAL],
      locale: 'ar',
    },
    {
      email: 'demo.volunteer3@demo.alhusseiniya.app',
      firstName: 'Mariam',
      lastName: 'Jamil',
      roles: [RoleType.VOLUNTEER, RoleType.INDIVIDUAL],
      locale: 'en',
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of demoUsersConfig) {
    let user = await UserModel.findOne({ email: u.email });
    if (!user) {
      user = await UserModel.create({
        ...u,
        passwordHash: demoPasswordHash,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: false,
        timezone: 'UTC',
        isDemo: true,
      });
    } else {
      await UserModel.updateOne(
        { _id: user.id || user._id },
        {
          $set: {
            firstName: u.firstName,
            lastName: u.lastName,
            roles: u.roles,
            passwordHash: demoPasswordHash,
            isDemo: true,
            status: UserStatus.ACTIVE,
          },
        },
      );
    }
    createdUsers[u.email] = user;
  }

  // 4. Organizations (5 fictional demo entities per Section 7 & 8)
  const orgConfigs = [
    {
      name: 'Rahma Community Kitchen',
      slug: 'rahma-community-kitchen',
      description: 'Community-focused organization supporting food distribution and local humanitarian initiatives.',
      location: 'Najaf — Demo District',
      contactEmail: 'contact@rahma.demo.alhusseiniya.app',
      contactPhone: '+964-000-0003',
      createdById: createdUsers['demo.organization@demo.alhusseiniya.app'].id,
    },
    {
      name: 'Al-Noor Community Center',
      slug: 'al-noor-community-center',
      description: 'Demonstration community center supporting food distribution, volunteer coordination, and social services.',
      location: 'Karbala — Demo District',
      contactEmail: 'contact@alnoor.demo.alhusseiniya.app',
      contactPhone: '+964-000-0001',
      createdById: createdUsers['demo.organization@demo.alhusseiniya.app'].id,
    },
    {
      name: 'Karbala Service House',
      slug: 'karbala-service-house',
      description: 'Demonstration hospitality and relief center providing hot meals and guidance to pilgrims and families.',
      location: 'Karbala — Demo District',
      contactEmail: 'contact@servicehouse.demo.alhusseiniya.app',
      contactPhone: '+964-000-0002',
      createdById: createdUsers['demo.organization@demo.alhusseiniya.app'].id,
    },
    {
      name: 'Al-Wafa Hussainiya',
      slug: 'al-wafa-hussainiya',
      description: 'Civic gathering center coordinating seasonal relief packs, family aid, and educational seminars.',
      location: 'Mumbai — Demo District',
      contactEmail: 'contact@alwafa.demo.alhusseiniya.app',
      contactPhone: '+91-000-0004',
      createdById: createdUsers['demo.admin@demo.alhusseiniya.app'].id,
    },
    {
      name: 'Sabeel Community Initiative',
      slug: 'sabeel-community-initiative',
      description: 'Volunteer-driven initiative providing daily breakfast stations, water access, and logistical outreach.',
      location: 'Aurangabad — Demo District',
      contactEmail: 'contact@sabeel.demo.alhusseiniya.app',
      contactPhone: '+91-000-0005',
      createdById: createdUsers['demo.admin@demo.alhusseiniya.app'].id,
    },
  ];

  const createdOrgs: Record<string, any> = {};
  for (const org of orgConfigs) {
    let existing = await OrgModel.findOne({ slug: org.slug });
    if (!existing) {
      existing = await OrgModel.create({
        ...org,
        status: 'ACTIVE',
        verificationStatus: VerificationStatus.APPROVED,
        isDemo: true,
      });
    } else {
      await OrgModel.updateOne(
        { _id: existing.id || existing._id },
        {
          $set: {
            ...org,
            verificationStatus: VerificationStatus.APPROVED,
            isDemo: true,
          },
        },
      );
    }
    createdOrgs[org.slug] = existing;

    // Organization Verification Record
    await OrgVerifModel.findOneAndUpdate(
      { organizationId: existing.id || existing._id },
      {
        $set: {
          organizationId: existing.id || existing._id,
          status: VerificationStatus.APPROVED,
          reviewerId: createdUsers['demo.admin@demo.alhusseiniya.app'].id,
          decision: 'Approved during demo initialization',
          notes: 'Fictional demonstration verification record',
          isDemo: true,
        },
      },
      { upsert: true },
    );
  }

  // Link Hassan Ali as Org Admin member of Rahma Kitchen & Al-Noor Center
  const orgAdminUser = createdUsers['demo.organization@demo.alhusseiniya.app'];
  for (const slug of ['rahma-community-kitchen', 'al-noor-community-center']) {
    await MemberModel.findOneAndUpdate(
      {
        organizationId: createdOrgs[slug].id || createdOrgs[slug]._id,
        userId: orgAdminUser.id || orgAdminUser._id,
      },
      {
        $set: {
          organizationId: createdOrgs[slug].id || createdOrgs[slug]._id,
          userId: orgAdminUser.id || orgAdminUser._id,
          role: 'ADMIN',
          status: 'ACTIVE',
          isDemo: true,
        },
      },
      { upsert: true },
    );
  }

  // 5. Food Programs (8 programs with lifecycle diversity per Section 9 & 10)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const todayStr = new Date().toISOString().split('T')[0];

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 3);
  const pastDateStr = pastDate.toISOString().split('T')[0];

  const foodConfigs = [
    {
      title: 'Community Meal Service',
      orgSlug: 'rahma-community-kitchen',
      description: 'Hot nutritious meal service prepared with dignified table hospitality and family takeaway trays.',
      location: 'Najaf — Demo District',
      programDate: tomorrowStr,
      startTime: '12:00',
      endTime: '15:00',
      capacity: 120,
      remainingCapacity: 72,
      status: ProgramStatus.ACTIVE,
      instructions: 'Demonstration service: Open to all families and individuals. No formal credentials required.',
    },
    {
      title: 'Evening Meal Distribution',
      orgSlug: 'al-noor-community-center',
      description: 'Fresh evening family dinner parcels distributed following sunset prayers.',
      location: 'Karbala — Demo District',
      programDate: tomorrowStr,
      startTime: '18:30',
      endTime: '20:30',
      capacity: 80,
      remainingCapacity: 18,
      status: ProgramStatus.ACTIVE,
      instructions: 'Demonstration service: Limited remaining capacity. Please reserve in advance.',
    },
    {
      title: 'Visitor Meal Service',
      orgSlug: 'karbala-service-house',
      description: 'Continuous hot meal service and refreshment station for pilgrims and traveling families.',
      location: 'Karbala — Demo District',
      programDate: todayStr,
      startTime: '11:00',
      endTime: '21:00',
      capacity: 200,
      remainingCapacity: 134,
      status: ProgramStatus.ACTIVE,
      instructions: 'Demonstration service: Continuous hot tea, bread, and stew station.',
    },
    {
      title: 'Daily Hot Lunch Distribution',
      orgSlug: 'rahma-community-kitchen',
      description: 'Daily community luncheon service providing warm meals to neighborhood workers and elders.',
      location: 'Najaf — Demo District',
      programDate: todayStr,
      startTime: '12:30',
      endTime: '14:30',
      capacity: 150,
      remainingCapacity: 0,
      status: ProgramStatus.FULL,
      instructions: 'Demonstration: Fully booked for today. Walk-ins accommodated if surplus is available.',
    },
    {
      title: 'Weekend Family Food Parcels',
      orgSlug: 'al-wafa-hussainiya',
      description: 'Dry food parcels containing rice, lentils, oil, tea, and essential staples for weekly sustenance.',
      location: 'Mumbai — Demo District',
      programDate: tomorrowStr,
      startTime: '10:00',
      endTime: '13:00',
      capacity: 60,
      remainingCapacity: 45,
      status: ProgramStatus.ACTIVE,
      instructions: 'Demonstration: Sturdy boxed parcels suitable for household transport.',
    },
    {
      title: 'Morning Bread & Breakfast Station',
      orgSlug: 'sabeel-community-initiative',
      description: 'Early morning station offering fresh traditional bread, warm lentils, and hot tea.',
      location: 'Aurangabad — Demo District',
      programDate: tomorrowStr,
      startTime: '06:30',
      endTime: '09:30',
      capacity: 100,
      remainingCapacity: 12,
      status: ProgramStatus.ACTIVE,
      instructions: 'Demonstration: Limited early-morning capacity remaining.',
    },
    {
      title: 'Special Community Gathering Supper',
      orgSlug: 'al-noor-community-center',
      description: 'Communal dinner banquet fostering neighborly bonds and social fellowship.',
      location: 'Karbala — Demo District',
      programDate: nextWeekStr,
      startTime: '19:00',
      endTime: '21:30',
      capacity: 90,
      remainingCapacity: 90,
      status: ProgramStatus.SCHEDULED,
      instructions: 'Demonstration: Scheduled for next week. Reservations open now.',
    },
    {
      title: 'Seasonal Relief Food Pack',
      orgSlug: 'karbala-service-house',
      description: 'Past food distribution drive successfully concluded with full delivery to registered households.',
      location: 'Karbala — Demo District',
      programDate: pastDateStr,
      startTime: '10:00',
      endTime: '16:00',
      capacity: 250,
      remainingCapacity: 0,
      status: ProgramStatus.COMPLETED,
      instructions: 'Demonstration: Program concluded.',
    },
  ];

  const createdFoodPrograms: any[] = [];
  for (const food of foodConfigs) {
    const org = createdOrgs[food.orgSlug];
    let prog = await FoodModel.findOne({
      organizationId: org.id || org._id,
      title: food.title,
    });
    if (!prog) {
      prog = await FoodModel.create({
        organizationId: org.id || org._id,
        title: food.title,
        description: food.description,
        location: food.location,
        programDate: food.programDate,
        startTime: food.startTime,
        endTime: food.endTime,
        capacity: food.capacity,
        remainingCapacity: food.remainingCapacity,
        status: food.status,
        instructions: food.instructions,
        isDemo: true,
      });
    } else {
      await FoodModel.updateOne(
        { _id: prog.id || prog._id },
        {
          $set: {
            description: food.description,
            location: food.location,
            programDate: food.programDate,
            startTime: food.startTime,
            endTime: food.endTime,
            capacity: food.capacity,
            remainingCapacity: food.remainingCapacity,
            status: food.status,
            instructions: food.instructions,
            isDemo: true,
          },
        },
      );
    }
    createdFoodPrograms.push(prog);
  }

  // Demo food reservation for Omar Kareem (Requester) & Amina Hassan (Individual)
  const requesterUser = createdUsers['demo.requester@demo.alhusseiniya.app'];
  const individualUser = createdUsers['demo.individual@demo.alhusseiniya.app'];

  if (createdFoodPrograms.length > 0) {
    await FoodAvailModel.findOneAndUpdate(
      {
        programId: createdFoodPrograms[0].id || createdFoodPrograms[0]._id,
        userId: requesterUser.id || requesterUser._id,
      },
      {
        $set: {
          programId: createdFoodPrograms[0].id || createdFoodPrograms[0]._id,
          userId: requesterUser.id || requesterUser._id,
          count: 2,
          status: 'RESERVED',
          notes: 'Demo reservation for family',
          isDemo: true,
        },
      },
      { upsert: true },
    );

    await FoodAvailModel.findOneAndUpdate(
      {
        programId: createdFoodPrograms[1].id || createdFoodPrograms[1]._id,
        userId: individualUser.id || individualUser._id,
      },
      {
        $set: {
          programId: createdFoodPrograms[1].id || createdFoodPrograms[1]._id,
          userId: individualUser.id || individualUser._id,
          count: 1,
          status: 'RESERVED',
          notes: 'Demo reservation',
          isDemo: true,
        },
      },
      { upsert: true },
    );
  }

  // 6. Humanitarian Requests (6 requests covering full lifecycle per Section 11 & 12)
  const reqConfigs = [
    {
      title: 'Emergency family food package assistance',
      shortDescription: 'Request for dry pantry food parcel.',
      description: 'Demonstration request: Family seeking essential non-perishable pantry items and dry staples for the coming week.',
      categoryCode: 'FOOD_ASSISTANCE',
      status: RequestStatus.SUBMITTED,
      priority: RequestPriority.NORMAL,
      location: 'Najaf — Demo District',
      orgSlug: null,
      matchedOrgSlug: null,
    },
    {
      title: 'Elderly prescription subsidy support',
      shortDescription: 'Support for monthly routine medication costs.',
      description: 'Demonstration request: Verification of prescription receipts for elderly cardiac and diabetes medication.',
      categoryCode: 'MEDICAL_SUPPORT',
      status: RequestStatus.UNDER_REVIEW,
      priority: RequestPriority.HIGH,
      location: 'Karbala — Demo District',
      orgSlug: null,
      matchedOrgSlug: null,
    },
    {
      title: 'Winter blankets and home heating assistance',
      shortDescription: 'Warm bedding kits for seasonal cold snap.',
      description: 'Demonstration request: Seeking warm blankets, thermal jackets, and heating fuel assistance for low-income household.',
      categoryCode: 'WINTER_RELIEF',
      status: RequestStatus.MATCHED,
      priority: RequestPriority.NORMAL,
      location: 'Mumbai — Demo District',
      orgSlug: null,
      matchedOrgSlug: 'al-wafa-hussainiya',
    },
    {
      title: 'Special dietary nutrition basket',
      shortDescription: 'Dietary groceries for post-operative recovery.',
      description: 'Demonstration request: Low-sodium, high-protein dietary assistance requested following minor medical recovery.',
      categoryCode: 'FOOD_ASSISTANCE',
      status: RequestStatus.ACCEPTED,
      priority: RequestPriority.NORMAL,
      location: 'Najaf — Demo District',
      orgSlug: 'rahma-community-kitchen',
      matchedOrgSlug: null,
      acceptedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
    {
      title: 'Volunteer transportation assistance for clinical checkup',
      shortDescription: 'Transit escort for mobility-impaired resident.',
      description: 'Demonstration request: Coordination with volunteer driver for hospital checkup transit and wheelchair assistance.',
      categoryCode: 'COMMUNITY_SERVICE',
      status: RequestStatus.IN_PROGRESS,
      priority: RequestPriority.NORMAL,
      location: 'Karbala — Demo District',
      orgSlug: 'al-noor-community-center',
      matchedOrgSlug: null,
      acceptedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
    {
      title: 'Community kitchen warm family meals delivery',
      shortDescription: 'Meal parcels prepared and delivered.',
      description: 'Demonstration request: Delivered hot family meal boxes during community solidarity week.',
      categoryCode: 'FOOD_ASSISTANCE',
      status: RequestStatus.COMPLETED,
      priority: RequestPriority.NORMAL,
      location: 'Najaf — Demo District',
      orgSlug: 'rahma-community-kitchen',
      matchedOrgSlug: null,
      acceptedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
  ];

  const createdRequests: any[] = [];
  for (const rc of reqConfigs) {
    const category = createdCategories[rc.categoryCode];
    const org = rc.orgSlug ? createdOrgs[rc.orgSlug] : null;
    const matchedOrg = rc.matchedOrgSlug ? createdOrgs[rc.matchedOrgSlug] : null;

    let req = await RequestModel.findOne({
      requesterId: requesterUser.id || requesterUser._id,
      title: rc.title,
    });

    const payload = {
      requesterId: requesterUser.id || requesterUser._id,
      organizationId: org ? org.id || org._id : null,
      matchedOrganizationId: matchedOrg ? matchedOrg.id || matchedOrg._id : null,
      categoryId: category ? category.id || category._id : 'cat-demo',
      title: rc.title,
      shortDescription: rc.shortDescription,
      description: rc.description,
      location: rc.location,
      status: rc.status,
      priority: rc.priority,
      isPrivate: true,
      isDemo: true,
      acceptedAt: (rc as any).acceptedAt || null,
      completedAt: (rc as any).completedAt || null,
    };

    if (!req) {
      req = await RequestModel.create(payload);
    } else {
      await RequestModel.updateOne({ _id: req.id || req._id }, { $set: payload });
    }
    createdRequests.push(req);

    // Seed status history for tracking transitions
    await RequestHistModel.findOneAndUpdate(
      { requestId: req.id || req._id, newStatus: rc.status },
      {
        $set: {
          requestId: req.id || req._id,
          previousStatus: RequestStatus.SUBMITTED,
          newStatus: rc.status,
          changedById: orgAdminUser.id || orgAdminUser._id,
          reason: `Demo transition to ${rc.status}`,
          isDemo: true,
        },
      },
      { upsert: true },
    );
  }

  // 7. Events (6 fictional events per Section 13)
  const eventConfigs = [
    {
      title: 'Community Meal Initiative',
      orgSlug: 'rahma-community-kitchen',
      description: 'Demonstration event: Welcoming community meal bringing neighbors together in fellowship.',
      location: 'Najaf — Demo District',
      startAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      endAt: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 3 * 3600 * 1000),
      category: 'MEALS',
      capacity: 150,
      registrationCount: 42,
      format: 'ON_SITE',
      status: 'PUBLISHED',
    },
    {
      title: 'Volunteer Orientation & Skills Workshop',
      orgSlug: 'al-noor-community-center',
      description: 'Demonstration event: Training session for new volunteers in distribution safety and dignified coordination.',
      location: 'Karbala — Demo District',
      startAt: new Date(Date.now() + 4 * 24 * 3600 * 1000),
      endAt: new Date(Date.now() + 4 * 24 * 3600 * 1000 + 2 * 3600 * 1000),
      category: 'VOLUNTEERING',
      capacity: 50,
      registrationCount: 15,
      format: 'HYBRID',
      status: 'REGISTRATION_OPEN',
    },
    {
      title: 'Values of Karbala Cultural Seminar',
      orgSlug: 'karbala-service-house',
      description: 'Demonstration event: Educational seminar on social justice, community solidarity, and historic humanitarian values.',
      location: 'Karbala — Demo District',
      startAt: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      endAt: new Date(Date.now() + 5 * 24 * 3600 * 1000 + 4 * 3600 * 1000),
      category: 'EDUCATION',
      capacity: 200,
      registrationCount: 88,
      format: 'ON_SITE',
      status: 'PUBLISHED',
    },
    {
      title: 'Community Service & Neighborhood Clean-up Day',
      orgSlug: 'sabeel-community-initiative',
      description: 'Demonstration event: Joint neighborhood beautification, public water upkeep, and street assistance campaign.',
      location: 'Aurangabad — Demo District',
      startAt: new Date(Date.now() + 6 * 24 * 3600 * 1000),
      endAt: new Date(Date.now() + 6 * 24 * 3600 * 1000 + 5 * 3600 * 1000),
      category: 'COMMUNITY_SERVICE',
      capacity: 60,
      registrationCount: 28,
      format: 'ON_SITE',
      status: 'PUBLISHED',
    },
    {
      title: 'Warmth in Winter Aid Distribution Camp',
      orgSlug: 'al-wafa-hussainiya',
      description: 'Demonstration event: Winter thermal pack and blanket distribution for registered households.',
      location: 'Mumbai — Demo District',
      startAt: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      endAt: new Date(Date.now() + 3 * 24 * 3600 * 1000 + 4 * 3600 * 1000),
      category: 'RELIEF',
      capacity: 100,
      registrationCount: 100,
      format: 'ON_SITE',
      status: 'FULL',
    },
    {
      title: 'Volunteer Logistics Coordination Session',
      orgSlug: 'al-noor-community-center',
      description: 'Demonstration event: Online debriefing and route review for completed regional distribution drives.',
      location: 'Online Conference — Demo Room',
      startAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      endAt: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 2 * 3600 * 1000),
      category: 'LOGISTICS',
      capacity: 30,
      registrationCount: 30,
      format: 'ONLINE',
      status: 'COMPLETED',
    },
  ];

  const createdEvents: any[] = [];
  for (const ev of eventConfigs) {
    const org = createdOrgs[ev.orgSlug];
    let existing = await EventModel.findOne({
      organizationId: org.id || org._id,
      title: ev.title,
    });
    if (!existing) {
      existing = await EventModel.create({
        organizerId: orgAdminUser.id || orgAdminUser._id,
        organizationId: org.id || org._id,
        title: ev.title,
        description: ev.description,
        location: ev.location,
        startAt: ev.startAt,
        endAt: ev.endAt,
        category: ev.category,
        capacity: ev.capacity,
        registrationCount: ev.registrationCount,
        format: ev.format,
        status: ev.status,
        isDemo: true,
      });
    } else {
      await EventModel.updateOne(
        { _id: existing.id || existing._id },
        {
          $set: {
            description: ev.description,
            location: ev.location,
            startAt: ev.startAt,
            endAt: ev.endAt,
            category: ev.category,
            capacity: ev.capacity,
            registrationCount: ev.registrationCount,
            format: ev.format,
            status: ev.status,
            isDemo: true,
          },
        },
      );
    }
    createdEvents.push(existing);
  }

  // Register Zainab Noor (Volunteer) for Volunteer Workshop
  const volunteerUser = createdUsers['demo.volunteer@demo.alhusseiniya.app'];
  if (createdEvents.length > 1) {
    await EventRegModel.findOneAndUpdate(
      {
        eventId: createdEvents[1].id || createdEvents[1]._id,
        userId: volunteerUser.id || volunteerUser._id,
      },
      {
        $set: {
          eventId: createdEvents[1].id || createdEvents[1]._id,
          userId: volunteerUser.id || volunteerUser._id,
          status: 'CONFIRMED',
          notes: 'Demonstration volunteer registration',
          isDemo: true,
        },
      },
      { upsert: true },
    );
  }

  // 8. Volunteers (6 fictional profiles per Section 14)
  const volConfigs = [
    {
      userEmail: 'demo.volunteer@demo.alhusseiniya.app',
      skills: ['Food distribution', 'Registration assistance', 'Translation'],
      interests: ['Community meals', 'Event assistance'],
      availability: 'Weekends & Evenings',
      location: 'Karbala — Demo District',
      languages: ['Arabic', 'English'],
    },
    {
      userEmail: 'demo.volunteer2@demo.alhusseiniya.app',
      skills: ['Logistics', 'Vehicle driving', 'Heavy lifting'],
      interests: ['Supply chains', 'Emergency relief'],
      availability: 'Full-time / Flexible',
      location: 'Najaf — Demo District',
      languages: ['Arabic'],
    },
    {
      userEmail: 'demo.volunteer3@demo.alhusseiniya.app',
      skills: ['Community support', 'Elderly assistance', 'Event coordination'],
      interests: ['Healthcare outreach', 'Senior visits'],
      availability: 'Weekday Mornings',
      location: 'Mumbai — Demo District',
      languages: ['English', 'Hindi', 'Urdu'],
    },
    {
      userEmail: 'demo.individual@demo.alhusseiniya.app',
      skills: ['Food preparation', 'Hygiene & safety', 'Registration'],
      interests: ['Kitchen service', 'Hygiene kits'],
      availability: 'Evenings',
      location: 'Aurangabad — Demo District',
      languages: ['English', 'Urdu'],
    },
    {
      userEmail: 'demo.contributor2@demo.alhusseiniya.app',
      skills: ['Translation (Ar/En/Ur)', 'Registration desk', 'First aid'],
      interests: ['Education', 'Language support'],
      availability: 'Remote / On-call',
      location: 'Baghdad — Demo District',
      languages: ['Arabic', 'English'],
    },
    {
      userEmail: 'demo.contributor3@demo.alhusseiniya.app',
      skills: ['Crowd coordination', 'Information guidance', 'Logistics'],
      interests: ['Pilgrim hospitality', 'Guidance desks'],
      availability: 'Weekends',
      location: 'Karbala — Demo District',
      languages: ['Arabic', 'English'],
    },
  ];

  let volunteerCount = 0;
  for (const vc of volConfigs) {
    const user = createdUsers[vc.userEmail];
    if (user) {
      await VolProfileModel.findOneAndUpdate(
        { userId: user.id || user._id },
        {
          $set: {
            userId: user.id || user._id,
            skills: vc.skills,
            interests: vc.interests,
            availability: vc.availability,
            location: vc.location,
            languages: vc.languages,
            status: 'ACTIVE',
            isDemo: true,
          },
        },
        { upsert: true },
      );
      volunteerCount++;
    }
  }

  // Seed Volunteer Opportunity & Application
  const oppOrg = createdOrgs['rahma-community-kitchen'];
  let opp = await VolOppModel.findOne({
    organizationId: oppOrg.id || oppOrg._id,
    title: 'Hot Meal Packing & Delivery Team',
  });
  if (!opp) {
    opp = await VolOppModel.create({
      organizationId: oppOrg.id || oppOrg._id,
      title: 'Hot Meal Packing & Delivery Team',
      description: 'Demonstration opportunity: Assist kitchen staff with assembling meal boxes and delivery logistics.',
      location: 'Najaf — Demo District',
      category: 'COMMUNITY_SERVICE',
      startAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      endAt: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 4 * 3600 * 1000),
      capacity: 15,
      status: 'OPEN',
      isDemo: true,
    });
  }

  await VolAppModel.findOneAndUpdate(
    {
      opportunityId: opp.id || opp._id,
      userId: volunteerUser.id || volunteerUser._id,
    },
    {
      $set: {
        opportunityId: opp.id || opp._id,
        userId: volunteerUser.id || volunteerUser._id,
        status: 'ACCEPTED',
        message: 'Excited to assist with packing and distribution.',
        isDemo: true,
      },
    },
    { upsert: true },
  );

  // 9. Businesses (4 fictional businesses per Section 15)
  const businessUser = createdUsers['demo.business@demo.alhusseiniya.app'];
  const bizConfigs = [
    {
      name: 'Al-Barka Bakeries & Pantry',
      category: 'Grocery',
      description: 'Demonstration local bakery contributing fresh flatbread and surplus baked goods to community kitchens.',
      location: 'Karbala — Demo District',
      contactEmail: 'albarka.demo@demo.alhusseiniya.app',
      participationTypes: ['SURPLUS_FOOD', 'SPONSORSHIP'],
      verificationStatus: VerificationStatus.APPROVED,
    },
    {
      name: 'Al-Atheer Logistics & Fleet',
      category: 'Logistics',
      description: 'Demonstration transportation outfit offering scheduled van support for humanitarian meal delivery.',
      location: 'Najaf — Demo District',
      contactEmail: 'alatheer.demo@demo.alhusseiniya.app',
      participationTypes: ['LOGISTICS'],
      verificationStatus: VerificationStatus.APPROVED,
    },
    {
      name: 'Zulal Water Supply Co.',
      category: 'Catering',
      description: 'Demonstration water purification and bulk bottled water provider for public pilgrim stations.',
      location: 'Karbala — Demo District',
      contactEmail: 'zulal.demo@demo.alhusseiniya.app',
      participationTypes: ['MEALS', 'SPONSORSHIP'],
      verificationStatus: VerificationStatus.APPROVED,
    },
    {
      name: 'Al-Ihsan Fresh Produce',
      category: 'Grocery',
      description: 'Demonstration market vendor donating weekly seasonal vegetables for communal food services.',
      location: 'Mumbai — Demo District',
      contactEmail: 'freshproduce.demo@demo.alhusseiniya.app',
      participationTypes: ['SURPLUS_FOOD'],
      verificationStatus: VerificationStatus.APPROVED,
    },
  ];

  const createdBusinesses: any[] = [];
  for (const bz of bizConfigs) {
    let existing = await BizModel.findOne({ name: bz.name });
    if (!existing) {
      existing = await BizModel.create({
        ...bz,
        ownerId: businessUser.id || businessUser._id,
        status: 'ACTIVE',
        isDemo: true,
      });
    } else {
      await BizModel.updateOne(
        { _id: existing.id || existing._id },
        {
          $set: {
            ...bz,
            ownerId: businessUser.id || businessUser._id,
            isDemo: true,
          },
        },
      );
    }
    createdBusinesses.push(existing);
  }

  // 10. Contributors (3 educational profiles) and Knowledge Articles (8 articles per Section 16, 17, 18)
  const contribConfigs = [
    {
      userEmail: 'demo.contributor@demo.alhusseiniya.app',
      biography: 'Community educator and researcher focused on civic responsibility, mutual aid traditions, and community service ethics.',
    },
    {
      userEmail: 'demo.contributor2@demo.alhusseiniya.app',
      biography: 'Educational writer engaged in youth civic projects and humanitarian literature.',
    },
    {
      userEmail: 'demo.contributor3@demo.alhusseiniya.app',
      biography: 'Educational researcher exploring historic mutual aid models and social welfare ethics.',
    },
  ];

  for (const cc of contribConfigs) {
    const user = createdUsers[cc.userEmail];
    if (user) {
      await ContribModel.findOneAndUpdate(
        { userId: user.id || user._id },
        {
          $set: {
            userId: user.id || user._id,
            contributorType: ContributorType.COMMUNITY_EDUCATOR,
            biography: cc.biography,
            verificationStatus: VerificationStatus.APPROVED,
            reviewStatus: ContributorReviewStatus.APPROVED,
            visibility: true,
            isDemo: true,
          },
        },
        { upsert: true },
      );
    }
  }

  const primaryContrib = createdUsers['demo.contributor@demo.alhusseiniya.app'];
  const modUser = createdUsers['demo.moderator@demo.alhusseiniya.app'];

  // 8 Knowledge Articles (neutral explanatory text without fabricated quotes per Section 16)
  const articlesConfigs = [
    {
      title: 'Understanding Ashura: Principles of Sacrifice, Dignity, and Justice',
      summary: 'An educational overview exploring how the enduring memory of Karbala inspires ongoing compassion and civic service.',
      body: 'Ashura represents a pivotal moment in human conscience, highlighting the universal ideals of standing against oppression and extending dignity to every human soul. In modern civic life, these values find expression in mutual aid, selflessness, and continuous care for the underserved.',
      category: 'VALUES',
      reviewStatus: ContributorReviewStatus.APPROVED,
      publicationStatus: ContentPublicationStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
    },
    {
      title: 'The Meaning of Arbaeen: Global Hospitality and Neighborly Solidarity',
      summary: 'Reflections on the spirit of unconditioned generosity, community hosting, and peaceful gathering.',
      body: 'The walk of Arbaeen offers a living testament to hospitality without distinction. Families open their homes, share nourishment freely, and tend to weary travelers. This culture of hospitality serves as an inspiring blueprint for humanitarian communities year-round.',
      category: 'COMMUNITY',
      reviewStatus: ContributorReviewStatus.APPROVED,
      publicationStatus: ContentPublicationStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000),
    },
    {
      title: 'Service and Community: The Ethics of Selfless Giving',
      summary: 'Examining how community volunteering transforms both the giver and the wider neighborhood.',
      body: 'Dignified service recognizes the shared humanity between those who offer help and those who receive it. True humanitarianism uplifts personal dignity and builds lasting social bonds based on mutual respect and shared responsibility.',
      category: 'ETHICS',
      reviewStatus: ContributorReviewStatus.APPROVED,
      publicationStatus: ContentPublicationStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000),
    },
    {
      title: 'Compassion in Action: Supporting Vulnerable Neighbors',
      summary: 'Practical approaches for organizing dignified neighborly support networks in urban districts.',
      body: 'Caring for our immediate neighbors is the foundation of any resilient community. From checking in on elderly residents to preparing emergency meals, small consistent acts of kindness collectively transform neighborhoods.',
      category: 'GUIDANCE',
      reviewStatus: ContributorReviewStatus.APPROVED,
      publicationStatus: ContentPublicationStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
    },
    {
      title: 'Community Service During Muharram: Moving from Remembrance to Action',
      summary: 'How memorial gatherings naturally translate into organized charitable outreach and community support.',
      body: 'Remembrance achieves its highest manifestation when coupled with constructive action. Across the globe, memorial traditions have birthed blood donation drives, food banks, medical clinics, and clean water projects.',
      category: 'CIVIC_ACTION',
      reviewStatus: ContributorReviewStatus.APPROVED,
      publicationStatus: ContentPublicationStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    },
    {
      title: 'Lessons of Karbala for Modern Humanitarian Work',
      summary: 'Exploring organizational integrity, ethical leadership, and transparent aid distribution.',
      body: 'Ethical humanitarian delivery demands unwavering integrity, equitable allocation of resources, and deep respect for beneficiary privacy. These principles mirror the high standards established in historical traditions of service.',
      category: 'ANALYSIS',
      reviewStatus: ContributorReviewStatus.UNDER_ADMIN_REVIEW,
      publicationStatus: ContentPublicationStatus.UNDER_REVIEW,
      publishedAt: null,
    },
    {
      title: 'Helping Neighbours: Civic Care in Multi-Faith Communities',
      summary: 'Draft handbook on cross-community charitable cooperation, mutual respect, and neighborly inclusion.',
      body: 'Effective community outreach transcends boundaries, providing warm assistance, emergency shelter, and open meal kitchens to all neighbors regardless of background.',
      category: 'DRAFT_ESSAY',
      reviewStatus: ContributorReviewStatus.CHANGES_REQUESTED,
      publicationStatus: ContentPublicationStatus.DRAFT,
      publishedAt: null,
      reviewNotes: 'Demonstration reviewer note: Please expand on practical local council coordination examples.',
    },
    {
      title: 'From Remembrance to Service: A Historical Overview',
      summary: 'Archived monograph reviewing community meal traditions and hospitality houses.',
      body: 'This historical survey tracks the institutionalization of community kitchens and hospitality centers across historical transit routes.',
      category: 'HISTORICAL_ARCHIVE',
      reviewStatus: ContributorReviewStatus.APPROVED,
      publicationStatus: ContentPublicationStatus.ARCHIVED,
      publishedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
    },
  ];

  const createdArticles: any[] = [];
  for (const art of articlesConfigs) {
    let existing = await KnowledgeModel.findOne({ title: art.title });
    if (!existing) {
      existing = await KnowledgeModel.create({
        ...art,
        contributorId: primaryContrib.id || primaryContrib._id,
        reviewerId: modUser.id || modUser._id,
        language: 'en',
        isDemo: true,
      });
    } else {
      await KnowledgeModel.updateOne(
        { _id: existing.id || existing._id },
        {
          $set: {
            ...art,
            contributorId: primaryContrib.id || primaryContrib._id,
            reviewerId: modUser.id || modUser._id,
            isDemo: true,
          },
        },
      );
    }
    createdArticles.push(existing);
  }

  // 11. Notifications (14 realistic notifications per Section 19)
  const notifConfigs = [
    {
      userId: requesterUser.id || requesterUser._id,
      type: 'request.created',
      title: 'Request Received',
      body: 'Your assistance request "Emergency family food package assistance" has been received.',
      referenceType: 'REQUEST',
      referenceId: createdRequests[0]?.id || createdRequests[0]?._id,
    },
    {
      userId: requesterUser.id || requesterUser._id,
      type: 'request.review',
      title: 'Request Under Review',
      body: 'Your request "Elderly prescription subsidy support" is now under active review.',
      referenceType: 'REQUEST',
      referenceId: createdRequests[1]?.id || createdRequests[1]?._id,
    },
    {
      userId: requesterUser.id || requesterUser._id,
      type: 'request.accepted',
      title: 'Request Accepted',
      body: 'Rahma Community Kitchen accepted your assistance request "Special dietary nutrition basket".',
      referenceType: 'REQUEST',
      referenceId: createdRequests[3]?.id || createdRequests[3]?._id,
    },
    {
      userId: requesterUser.id || requesterUser._id,
      type: 'request.completed',
      title: 'Delivery Completed',
      body: 'Your food assistance delivery "Community kitchen warm family meals delivery" has been completed.',
      referenceType: 'REQUEST',
      referenceId: createdRequests[5]?.id || createdRequests[5]?._id,
    },
    {
      userId: requesterUser.id || requesterUser._id,
      type: 'food.reserved',
      title: 'Meal Reservation Confirmed',
      body: 'Your meal reservation for Community Meal Service has been confirmed.',
      referenceType: 'FOOD_PROGRAM',
      referenceId: createdFoodPrograms[0]?.id || createdFoodPrograms[0]?._id,
    },
    {
      userId: orgAdminUser.id || orgAdminUser._id,
      type: 'organization.request.assigned',
      title: 'New Request Assigned',
      body: 'New humanitarian request "Special dietary nutrition basket" assigned to Rahma Community Kitchen.',
      referenceType: 'REQUEST',
      referenceId: createdRequests[3]?.id || createdRequests[3]?._id,
    },
    {
      userId: orgAdminUser.id || orgAdminUser._id,
      type: 'volunteer.applied',
      title: 'Volunteer Application',
      body: 'Volunteer Zainab Noor submitted an application for Hot Meal Packing & Delivery Team.',
      referenceType: 'VOLUNTEER',
      referenceId: volunteerUser.id || volunteerUser._id,
    },
    {
      userId: orgAdminUser.id || orgAdminUser._id,
      type: 'food.capacity.alert',
      title: 'Program Capacity Alert',
      body: 'Your food program "Community Meal Service" has reached 60% capacity.',
      referenceType: 'FOOD_PROGRAM',
      referenceId: createdFoodPrograms[0]?.id || createdFoodPrograms[0]?._id,
    },
    {
      userId: volunteerUser.id || volunteerUser._id,
      type: 'event.registered',
      title: 'Orientation Confirmed',
      body: 'Your registration for Volunteer Orientation & Skills Workshop has been confirmed.',
      referenceType: 'EVENT',
      referenceId: createdEvents[1]?.id || createdEvents[1]?._id,
    },
    {
      userId: volunteerUser.id || volunteerUser._id,
      type: 'volunteer.opportunity.new',
      title: 'Opportunity Open',
      body: 'New volunteer opportunity available: Hot Meal Packing & Delivery Team.',
      referenceType: 'VOLUNTEER_OPPORTUNITY',
      referenceId: opp.id || opp._id,
    },
    {
      userId: volunteerUser.id || volunteerUser._id,
      type: 'volunteer.shift.completed',
      title: 'Shift Recorded',
      body: 'Thank you for your completed service shift at the Community Center.',
      referenceType: 'VOLUNTEER',
      referenceId: volunteerUser.id || volunteerUser._id,
    },
    {
      userId: primaryContrib.id || primaryContrib._id,
      type: 'content.published',
      title: 'Article Published',
      body: 'Your educational article "Understanding Ashura" has been published.',
      referenceType: 'KNOWLEDGE',
      referenceId: createdArticles[0]?.id || createdArticles[0]?._id,
    },
    {
      userId: primaryContrib.id || primaryContrib._id,
      type: 'content.revision',
      title: 'Feedback Received',
      body: 'Reviewer feedback received on draft "Helping Neighbours: Civic Care in Multi-Faith Communities".',
      referenceType: 'KNOWLEDGE',
      referenceId: createdArticles[6]?.id || createdArticles[6]?._id,
    },
    {
      userId: createdUsers['demo.admin@demo.alhusseiniya.app'].id,
      type: 'moderation.alert',
      title: 'Moderation Alert',
      body: 'Moderation queue: 2 demonstration user reports are awaiting administrative review.',
      referenceType: 'REPORT',
      referenceId: null,
    },
  ];

  let notifCount = 0;
  for (const n of notifConfigs) {
    await NotificationModel.findOneAndUpdate(
      { userId: n.userId, title: n.title },
      {
        $set: {
          ...n,
          payload: {},
          readAt: null,
          isDemo: true,
        },
      },
      { upsert: true },
    );
    notifCount++;
  }

  // 12. Reports / Moderation (3 demo reports per Section 24)
  const reportConfigs = [
    {
      reporterId: individualUser.id || individualUser._id,
      targetType: ReportTargetType.BUSINESS,
      targetId: createdBusinesses[0]?.id || createdBusinesses[0]?._id,
      reason: 'Outdated contact phone number on business profile',
      description: 'Demonstration report: The listed phone number needs verification from the bakery manager.',
      status: ReportStatus.SUBMITTED,
      assignedReviewerId: null,
    },
    {
      reporterId: requesterUser.id || requesterUser._id,
      targetType: ReportTargetType.CONTENT,
      targetId: createdArticles[6]?.id || createdArticles[6]?._id,
      reason: 'Typographical formatting issue in draft introduction',
      description: 'Demonstration report: A sentence in the first paragraph is cut off. Needs editor review.',
      status: ReportStatus.IN_INVESTIGATION,
      assignedReviewerId: modUser.id || modUser._id,
    },
    {
      reporterId: volunteerUser.id || volunteerUser._id,
      targetType: ReportTargetType.USER,
      targetId: createdUsers['demo.volunteer2@demo.alhusseiniya.app'].id,
      reason: 'Demonstration test report: Duplicate profile check',
      description: 'Demonstration report: Inquiring if this volunteer account was created twice.',
      status: ReportStatus.RESOLVED,
      assignedReviewerId: modUser.id || modUser._id,
      resolution: 'Verified as a single valid profile. Resolved cleanly.',
      actionTaken: 'VERIFIED_ACCURATE',
    },
  ];

  let reportCount = 0;
  for (const rep of reportConfigs) {
    await ReportModel.findOneAndUpdate(
      { reporterId: rep.reporterId, reason: rep.reason },
      {
        $set: {
          ...rep,
          isDemo: true,
        },
      },
      { upsert: true },
    );
    reportCount++;
  }

  // 13. Natural Impact & Audit Logs (Section 20 & 25)
  const rahmaOrg = createdOrgs['rahma-community-kitchen'];
  const karbalaOrg = createdOrgs['karbala-service-house'];

  await ImpactModel.findOneAndUpdate(
    {
      entityType: 'ORGANIZATION',
      entityId: rahmaOrg.id || rahmaOrg._id,
      metricType: MetricType.MEALS_DISTRIBUTED,
    },
    {
      $set: {
        entityType: 'ORGANIZATION',
        entityId: rahmaOrg.id || rahmaOrg._id,
        metricType: MetricType.MEALS_DISTRIBUTED,
        value: 120,
        source: 'DEMO_FOOD_SERVICE',
        timestamp: new Date(),
        isDemo: true,
      },
    },
    { upsert: true },
  );

  await ImpactModel.findOneAndUpdate(
    {
      entityType: 'ORGANIZATION',
      entityId: karbalaOrg.id || karbalaOrg._id,
      metricType: MetricType.MEALS_DISTRIBUTED,
    },
    {
      $set: {
        entityType: 'ORGANIZATION',
        entityId: karbalaOrg.id || karbalaOrg._id,
        metricType: MetricType.MEALS_DISTRIBUTED,
        value: 250,
        source: 'DEMO_FOOD_SERVICE',
        timestamp: new Date(),
        isDemo: true,
      },
    },
    { upsert: true },
  );

  await ImpactModel.findOneAndUpdate(
    {
      entityType: 'REQUEST',
      entityId: createdRequests[5]?.id || createdRequests[5]?._id,
      metricType: MetricType.REQUESTS_FULFILLED,
    },
    {
      $set: {
        entityType: 'REQUEST',
        entityId: createdRequests[5]?.id || createdRequests[5]?._id,
        metricType: MetricType.REQUESTS_FULFILLED,
        value: 1,
        source: 'DEMO_REQUEST_LIFECYCLE',
        timestamp: new Date(),
        isDemo: true,
      },
    },
    { upsert: true },
  );

  // Audit Logs
  await AuditModel.findOneAndUpdate(
    { action: AuditAction.VERIFY, targetId: rahmaOrg.id || rahmaOrg._id },
    {
      $set: {
        actorId: createdUsers['demo.admin@demo.alhusseiniya.app'].id,
        action: AuditAction.VERIFY,
        targetType: 'ORGANIZATION',
        targetId: rahmaOrg.id || rahmaOrg._id,
        metadata: { reason: 'Demonstration verification after review' },
        requestId: 'demo-audit-001',
        ipAddress: '127.0.0.1',
        timestamp: new Date(),
        isDemo: true,
      },
    },
    { upsert: true },
  );

  // 14. Faeda Parent Company and Products (Section 26)
  let faeda = await CompanyModel.findOne({ slug: 'faeda' });
  if (!faeda) {
    faeda = await CompanyModel.create({
      name: {
        ar: 'فائدة',
        en: 'Faeda',
      },
      slug: 'faeda',
      description: {
        ar: 'منظومة تقنية تطوّر منصات رقمية لخدمة المجتمع، وتسهّل وصول الناس إلى الدعم الإنساني والفرص المهنية.',
        en: 'A technology group building practical digital platforms that serve communities, connecting people to relief, care, and career opportunities.',
      },
      shortDescription: {
        ar: 'منصات رقمية لخدمة المجتمع',
        en: 'Community and career platforms',
      },
      logo: null,
      website: null,
      status: 'ACTIVE',
      displayOrder: 1,
    });
  }

  // 1. Al-Husseiniya
  await ProductModel.findOneAndUpdate(
    { slug: 'al-husseiniya' },
    {
      $set: {
        companyId: faeda.id || faeda._id,
        name: {
          ar: 'منصة الحسينية',
          en: 'Al-Husseiniya Platform',
        },
        slug: 'al-husseiniya',
        description: {
          ar: 'منصة مجتمعية وإنسانية تعمل طوال العام لربط أصحاب الحاجة بالجهات المعتمدة والمتطوعين بكرامة ووضوح.',
          en: 'A community and humanitarian platform operating year-round to connect people in need with verified partners and volunteers with dignity and care.',
        },
        shortDescription: {
          ar: 'منصة إنسانية ومجتمعية على مدار العام',
          en: 'Year-Round Humanitarian & Community Platform',
        },
        category: {
          ar: 'منصة إنسانية ومجتمعية',
          en: 'Humanitarian & Community Platform',
        },
        status: 'ACTIVE',
        displayOrder: 1,
        featured: true,
      },
    },
    { upsert: true },
  );

  // 2. Faeda Jobs
  await ProductModel.findOneAndUpdate(
    { slug: 'faeda-jobs' },
    {
      $set: {
        companyId: faeda.id || faeda._id,
        name: {
          ar: 'وظائف فائدة',
          en: 'Faeda Jobs',
        },
        slug: 'faeda-jobs',
        description: {
          ar: 'منصة مهنية تساعد الباحثين عن عمل على إيجاد فرص وظيفية تناسب مهاراتهم، وتدعم أصحاب الأعمال في استقطاب الكفاءات.',
          en: 'A career platform connecting job seekers with meaningful work opportunities and helping organizations find dependable talent.',
        },
        shortDescription: {
          ar: 'منصة التوظيف والتطوير المهني',
          en: 'Career & Recruitment Platform',
        },
        category: {
          ar: 'منصة التوظيف والمهن',
          en: 'Career & Recruitment Platform',
        },
        status: 'ACTIVE',
        displayOrder: 2,
        featured: false,
      },
    },
    { upsert: true },
  );

  const counts: DemoSeedCounts = {
    users: Object.keys(createdUsers).length,
    organizations: Object.keys(createdOrgs).length,
    foodPrograms: createdFoodPrograms.length,
    requests: createdRequests.length,
    events: createdEvents.length,
    volunteers: volunteerCount,
    businesses: createdBusinesses.length,
    knowledgeArticles: createdArticles.length,
    contributors: contribConfigs.length,
    notifications: notifCount,
    reports: reportCount,
  };

  // Section 34 Seed Report
  console.log('================================');
  console.log('AL-HUSSEINIYA DEMO DATA');
  console.log('================================\n');
  console.log('Environment: DEMO\n');
  console.log(`Users: ${counts.users}`);
  console.log(`Organizations: ${counts.organizations}`);
  console.log(`Food Programs: ${counts.foodPrograms}`);
  console.log(`Requests: ${counts.requests}`);
  console.log(`Events: ${counts.events}`);
  console.log(`Volunteers: ${counts.volunteers}`);
  console.log(`Businesses: ${counts.businesses}`);
  console.log(`Knowledge: ${counts.knowledgeArticles}`);
  console.log(`Contributors: ${counts.contributors}`);
  console.log(`Notifications: ${counts.notifications}`);
  console.log(`Reports: ${counts.reports}\n`);
  console.log('Demo Admin:');
  console.log('demo.admin@demo.alhusseiniya.app\n');
  console.log('Demo Individual:');
  console.log('demo.individual@demo.alhusseiniya.app\n');
  console.log('Demo Organization:');
  console.log('demo.organization@demo.alhusseiniya.app\n');
  console.log('================================');

  return counts;
}
