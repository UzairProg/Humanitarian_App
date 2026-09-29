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
  Business,
  BusinessSchema,
  RequestCategory,
  RequestCategorySchema,
  HumanitarianRequest,
  HumanitarianRequestSchema,
  FoodProgram,
  FoodProgramSchema,
  Event,
  EventSchema,
  KnowledgeContent,
  KnowledgeContentSchema,
  ContributorProfile,
  ContributorProfileSchema,
  VolunteerProfile,
  VolunteerProfileSchema,
  VolunteerOpportunity,
  VolunteerOpportunitySchema,
  ImpactRecord,
  ImpactRecordSchema,
  AuditLog,
  AuditLogSchema,
} from '../schemas';

export async function runDevSeed(connection: Connection): Promise<void> {
  const UserModel = connection.model(User.name, UserSchema);
  const RoleModel = connection.model(Role.name, RoleSchema);
  const PermissionModel = connection.model(Permission.name, PermissionSchema);
  const OrgModel = connection.model(Organization.name, OrganizationSchema);
  const MemberModel = connection.model(OrganizationMember.name, OrganizationMemberSchema);
  const BusinessModel = connection.model(Business.name, BusinessSchema);
  const CategoryModel = connection.model(RequestCategory.name, RequestCategorySchema);
  const RequestModel = connection.model(HumanitarianRequest.name, HumanitarianRequestSchema);
  const FoodModel = connection.model(FoodProgram.name, FoodProgramSchema);
  const EventModel = connection.model(Event.name, EventSchema);
  const KnowledgeModel = connection.model(KnowledgeContent.name, KnowledgeContentSchema);
  const ContribModel = connection.model(ContributorProfile.name, ContributorProfileSchema);
  const VolProfileModel = connection.model(VolunteerProfile.name, VolunteerProfileSchema);
  const VolOppModel = connection.model(VolunteerOpportunity.name, VolunteerOpportunitySchema);
  const ImpactModel = connection.model(ImpactRecord.name, ImpactRecordSchema);
  const AuditModel = connection.model(AuditLog.name, AuditLogSchema);

  console.log('[Seed] Seeding Roles and Permissions...');
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

  console.log('[Seed] Seeding Users with secure hashed passwords...');
  const devPasswordHash = await bcrypt.hash(
    'AlHusseiniyaDev2026!',
    SECURITY_CONFIG.bcryptSaltRounds,
  );

  const seedUsersConfig = [
    { email: 'superadmin@alhusseiniya.org', firstName: 'System', lastName: 'SuperAdmin', role: RoleType.SUPER_ADMIN },
    { email: 'admin@alhusseiniya.org', firstName: 'Operations', lastName: 'Admin', role: RoleType.ADMIN },
    { email: 'moderator@alhusseiniya.org', firstName: 'Community', lastName: 'Moderator', role: RoleType.MODERATOR },
    { email: 'orgadmin@alhusseiniya.org', firstName: 'Relief', lastName: 'Director', role: RoleType.ORGANIZATION_ADMIN },
    { email: 'orgstaff@alhusseiniya.org', firstName: 'Relief', lastName: 'Staff', role: RoleType.ORGANIZATION_STAFF },
    { email: 'contributor@alhusseiniya.org', firstName: 'Community', lastName: 'Educator', role: RoleType.CONTRIBUTOR },
    { email: 'business@alhusseiniya.org', firstName: 'Merchant', lastName: 'Manager', role: RoleType.BUSINESS_ADMIN },
    { email: 'volunteer@alhusseiniya.org', firstName: 'Active', lastName: 'Volunteer', role: RoleType.VOLUNTEER },
    { email: 'user@alhusseiniya.org', firstName: 'Community', lastName: 'Member', role: RoleType.INDIVIDUAL },
  ];

  const createdUsers: Record<string, any> = {};

  for (const config of seedUsersConfig) {
    let user = await UserModel.findOne({ email: config.email });
    if (!user) {
      user = await UserModel.create({
        email: config.email,
        passwordHash: devPasswordHash,
        firstName: config.firstName,
        lastName: config.lastName,
        roles: [config.role],
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: false,
      });
    }
    createdUsers[config.email] = user;
  }

  console.log('[Seed] Seeding Request Categories...');
  const categoriesData = [
    {
      code: 'FOOD_ASSISTANCE',
      nameEn: 'Food & Nutrition Support',
      nameAr: 'دعم غذائي وتمويني',
      descriptionEn: 'Emergency food baskets, dry rations and daily meal packages',
      descriptionAr: 'سلل غذائية طارئة وحصص تموينية ووجبات غذائية',
    },
    {
      code: 'MEDICAL_AID',
      nameEn: 'Medical & Healthcare Aid',
      nameAr: 'مساعدات طبية ورعاية صحية',
      descriptionEn: 'Prescriptions, diagnostic help and critical medical supplies',
      descriptionAr: 'أدوية وفحوصات ومستلزمات طبية ضرورية',
    },
    {
      code: 'SHELTER_HOUSING',
      nameEn: 'Emergency Shelter & Utilities',
      nameAr: 'مأوى وسكن طارئ وفواتير',
      descriptionEn: 'Emergency lodging assistance, winter warming and essential bills',
      descriptionAr: 'مساعدة إيواء طارئ، تدفئة شتوية ومساعدات مرافق',
    },
    {
      code: 'EDUCATION_AID',
      nameEn: 'Student & Education Support',
      nameAr: 'دعم التعليم والطلبة',
      descriptionEn: 'School supplies, textbooks and academic registration support',
      descriptionAr: 'قرطاسية وكتب مدرسية ورسوم تسجيل دراسية',
    },
  ];

  const createdCategories: Record<string, any> = {};
  for (const cat of categoriesData) {
    let category = await CategoryModel.findOne({ code: cat.code });
    if (!category) {
      category = await CategoryModel.create({
        ...cat,
        isActive: true,
      });
    }
    createdCategories[cat.code] = category;
  }

  console.log('[Seed] Seeding Organizations...');
  let org = await OrgModel.findOne({ slug: 'karbala-relief-network' });
  if (!org) {
    org = await OrgModel.create({
      name: 'Karbala Relief Network',
      slug: 'karbala-relief-network',
      description: 'Community humanitarian initiative serving families in need throughout the year.',
      location: 'Central District, Community Center 4',
      contactEmail: 'contact@karbalarelief.example.org',
      contactPhone: '+1-555-0199',
      status: 'ACTIVE',
      verificationStatus: VerificationStatus.APPROVED,
      createdById: createdUsers['orgadmin@alhusseiniya.org'].id,
    });

    await MemberModel.create({
      organizationId: org.id,
      userId: createdUsers['orgadmin@alhusseiniya.org'].id,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    await MemberModel.create({
      organizationId: org.id,
      userId: createdUsers['orgstaff@alhusseiniya.org'].id,
      role: 'STAFF',
      status: 'ACTIVE',
    });
  }

  console.log('[Seed] Seeding Business...');
  let business = await BusinessModel.findOne({ name: 'Al-Baraka Halal Supplies' });
  if (!business) {
    business = await BusinessModel.create({
      name: 'Al-Baraka Halal Supplies',
      category: 'Food Wholesale & Groceries',
      description: 'Wholesale grains, packaging and community ration supplies partner.',
      location: 'Commercial Market Row, Block 12',
      contactEmail: 'orders@albaraka.example.com',
      contactPhone: '+1-555-0188',
      status: 'ACTIVE',
      verificationStatus: VerificationStatus.APPROVED,
      ownerId: createdUsers['business@alhusseiniya.org'].id,
    });
  }

  console.log('[Seed] Seeding Food Program...');
  let foodProg = await FoodModel.findOne({ title: 'Weekly Community Meal Distribution' });
  if (!foodProg) {
    foodProg = await FoodModel.create({
      organizationId: org.id,
      title: 'Weekly Community Meal Distribution',
      description: 'Hot, freshly prepared nutritious meals distributed every Friday to families in need.',
      location: 'Community Hall 1, Main Plaza',
      programDate: '2026-10-02',
      startTime: '12:00',
      endTime: '15:00',
      capacity: 300,
      remainingCapacity: 180,
      status: ProgramStatus.ACTIVE,
      instructions: 'Open to all community members in need. Reusable bags welcomed.',
    });
  }

  console.log('[Seed] Seeding Humanitarian Request (Private)...');
  let request = await RequestModel.findOne({ title: 'Emergency Food Basket for Elderly Household' });
  if (!request) {
    request = await RequestModel.create({
      requesterId: createdUsers['user@alhusseiniya.org'].id,
      categoryId: createdCategories['FOOD_ASSISTANCE'].id,
      title: 'Emergency Food Basket for Elderly Household',
      description: 'Monthly ration support needed for two seniors with restricted mobility.',
      location: 'West District, Sector B',
      status: RequestStatus.SUBMITTED,
      priority: RequestPriority.HIGH,
      isPrivate: true,
    });
  }

  console.log('[Seed] Seeding Community Event...');
  let event = await EventModel.findOne({ title: 'Volunteer Orientation & Winter Aid Planning' });
  if (!event) {
    event = await EventModel.create({
      organizerId: createdUsers['orgadmin@alhusseiniya.org'].id,
      organizationId: org.id,
      title: 'Volunteer Orientation & Winter Aid Planning',
      description: 'Briefing for volunteers helping coordinate logistics and distribution of winter essentials.',
      location: 'Relief Hub Hall B',
      startAt: new Date(Date.now() + 86400000 * 3),
      endAt: new Date(Date.now() + 86400000 * 3 + 7200000),
      category: 'COMMUNITY_WORKSHOP',
      status: 'PUBLISHED',
    });
  }

  console.log('[Seed] Seeding Contributor Profile & Knowledge...');
  let contrib = await ContribModel.findOne({ userId: createdUsers['contributor@alhusseiniya.org'].id });
  if (!contrib) {
    contrib = await ContribModel.create({
      userId: createdUsers['contributor@alhusseiniya.org'].id,
      contributorType: ContributorType.COMMUNITY_EDUCATOR,
      biography: 'Community researcher and educator focusing on charitable traditions and community welfare.',
      verificationStatus: VerificationStatus.PENDING,
      reviewStatus: ContributorReviewStatus.UNDER_ADMIN_REVIEW,
      visibility: false,
    });
  }

  let knowledge = await KnowledgeModel.findOne({ title: 'The Spirit of Giving: Lessons in Year-Round Service' });
  if (!knowledge) {
    await KnowledgeModel.create({
      title: 'The Spirit of Giving: Lessons in Year-Round Service',
      summary: 'Exploring how the timeless ethics of compassion translate into continuous community action.',
      body: 'Community service is not restricted to particular seasons. The tradition of caring for neighbors is a year-round commitment...',
      contributorId: createdUsers['contributor@alhusseiniya.org'].id,
      category: 'COMMUNITY_ETHICS',
      language: 'en',
      reviewStatus: ContributorReviewStatus.DRAFT,
      publicationStatus: ContentPublicationStatus.DRAFT,
    });
  }

  console.log('[Seed] Seeding Volunteer Opportunity & Profile...');
  let volProfile = await VolProfileModel.findOne({ userId: createdUsers['volunteer@alhusseiniya.org'].id });
  if (!volProfile) {
    await VolProfileModel.create({
      userId: createdUsers['volunteer@alhusseiniya.org'].id,
      skills: ['Logistics', 'Driving', 'Translation (Arabic/English)'],
      interests: ['Food Distribution', 'Elderly Care'],
      availability: 'Weekends & Friday afternoons',
      location: 'Central District',
      status: 'ACTIVE',
    });
  }

  let volOpp = await VolOppModel.findOne({ title: 'Food Distribution Helpers Needed' });
  if (!volOpp) {
    await VolOppModel.create({
      organizationId: org.id,
      title: 'Food Distribution Helpers Needed',
      description: 'Seeking 8 volunteers to assist in packaging, checking lists and handing out meal kits.',
      location: 'Community Hall 1, Main Plaza',
      startAt: new Date(Date.now() + 86400000 * 2),
      endAt: new Date(Date.now() + 86400000 * 2 + 14400000),
      requirements: ['Punctual', 'Ability to lift 10kg boxes', 'Friendly demeanor'],
      capacity: 8,
      status: 'OPEN',
    });
  }

  console.log('[Seed] Seeding Impact Record & Audit Log...');
  await ImpactModel.create({
    entityType: 'ORGANIZATION',
    entityId: org.id,
    metricType: MetricType.MEALS_DISTRIBUTED,
    value: 1250,
    source: 'FOOD_PROGRAM_VERIFIED_COUNT',
    timestamp: new Date(),
  });

  await AuditModel.create({
    actorId: createdUsers['admin@alhusseiniya.org'].id,
    action: AuditAction.VERIFY,
    targetType: 'ORGANIZATION',
    targetId: org.id,
    metadata: { reason: 'Initial seed verification after credentials check' },
    requestId: 'seed-req-001',
    ipAddress: '127.0.0.1',
  });

  console.log('[Seed] MongoDB Dev seed data successfully seeded!');
}
