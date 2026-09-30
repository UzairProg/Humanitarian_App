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
  Business,
  BusinessSchema,
  BusinessParticipation,
  BusinessParticipationSchema,
  RequestCategory,
  RequestCategorySchema,
  HumanitarianRequest,
  HumanitarianRequestSchema,
  FoodProgram,
  FoodProgramSchema,
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


export async function runDevSeed(connection: Connection): Promise<void> {
  const UserModel = connection.model(User.name, UserSchema);
  const RoleModel = connection.model(Role.name, RoleSchema);
  const PermissionModel = connection.model(Permission.name, PermissionSchema);
  const OrgModel = connection.model(Organization.name, OrganizationSchema);
  const MemberModel = connection.model(OrganizationMember.name, OrganizationMemberSchema);
  const BusinessModel = connection.model(Business.name, BusinessSchema);
  const BizPartModel = connection.model(BusinessParticipation.name, BusinessParticipationSchema);
  const CategoryModel = connection.model(RequestCategory.name, RequestCategorySchema);
  const RequestModel = connection.model(HumanitarianRequest.name, HumanitarianRequestSchema);
  const FoodModel = connection.model(FoodProgram.name, FoodProgramSchema);
  const EventModel = connection.model(Event.name, EventSchema);
  const EventRegModel = connection.model(EventRegistration.name, EventRegistrationSchema);
  const KnowledgeModel = connection.model(KnowledgeContent.name, KnowledgeContentSchema);
  const ContribModel = connection.model(ContributorProfile.name, ContributorProfileSchema);
  const VolProfileModel = connection.model(VolunteerProfile.name, VolunteerProfileSchema);
  const VolOppModel = connection.model(VolunteerOpportunity.name, VolunteerOpportunitySchema);
  const VolAppModel = connection.model(VolunteerApplication.name, VolunteerApplicationSchema);
  const ReportModel = connection.model(Report.name, ReportSchema);
  const NotificationModel = connection.model(Notification.name, NotificationSchema);
  const ImpactModel = connection.model(ImpactRecord.name, ImpactRecordSchema);
  const AuditModel = connection.model(AuditLog.name, AuditLogSchema);
  const CompanyModel = connection.model(Company.name, CompanySchema);
  const ProductModel = connection.model(CompanyProduct.name, CompanyProductSchema);

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
  const defaultPassword = 'AlHusseiniyaDev2026!';
  const passwordHash = await bcrypt.hash(defaultPassword, SECURITY_CONFIG.bcryptSaltRounds || 10);

  const seedUsers = [
    {
      email: 'admin@alhusseiniya.org',
      firstName: 'Platform',
      lastName: 'Administrator',
      roles: [RoleType.SUPER_ADMIN, RoleType.ADMIN],
    },
    {
      email: 'orgadmin@alhusseiniya.org',
      firstName: 'Zahra',
      lastName: 'Al-Hashemi',
      roles: [RoleType.ORGANIZATION_ADMIN],
    },
    {
      email: 'moderator@alhusseiniya.org',
      firstName: 'Ali',
      lastName: 'Reza',
      roles: [RoleType.MODERATOR],
    },
    {
      email: 'contributor@alhusseiniya.org',
      firstName: 'Dr. Hassan',
      lastName: 'Al-Musawi',
      roles: [RoleType.CONTRIBUTOR, RoleType.INDIVIDUAL],
    },
    {
      email: 'volunteer@alhusseiniya.org',
      firstName: 'Fatima',
      lastName: 'Karimi',
      roles: [RoleType.VOLUNTEER, RoleType.INDIVIDUAL],
    },
    {
      email: 'user@alhusseiniya.org',
      firstName: 'Hussain',
      lastName: 'Al-Amili',
      roles: [RoleType.INDIVIDUAL],
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of seedUsers) {
    let existing = await UserModel.findOne({ email: u.email });
    if (!existing) {
      existing = await UserModel.create({
        ...u,
        passwordHash,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: false,
        locale: 'en',
        timezone: 'UTC',
      });
    }
    createdUsers[u.email] = existing;
  }

  console.log('[Seed] Seeding Request Categories...');
  const categories = [
    { code: 'FOOD_ASSISTANCE', nameEn: 'Food Assistance', nameAr: 'المساعدات الغذائية' },
    { code: 'WINTER_RELIEF', nameEn: 'Winterization & Blankets', nameAr: 'مساعدات الشتاء والكسوة' },
    { code: 'MEDICAL_SUPPORT', nameEn: 'Emergency Medical Support', nameAr: 'الدعم الطبي الطارئ' },
    { code: 'ORPHAN_FAMILY', nameEn: 'Orphan & Family Sponsorship', nameAr: 'كفالة الأيتام والأسر' },
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

  console.log('[Seed] Seeding Organizations...');
  let org = await OrgModel.findOne({ slug: 'karbala-relief-foundation' });
  if (!org) {
    org = await OrgModel.create({
      name: 'Karbala Relief Foundation',
      slug: 'karbala-relief-foundation',
      description: 'Dedicated humanitarian NGO delivering continuous food, water, and emergency family aid.',
      location: 'Karbala Governorate & Regional Centers',
      contactEmail: 'contact@karbalarelief.org',
      contactPhone: '+964 780 123 4567',
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
  }

  console.log('[Seed] Seeding Business...');
  let biz = await BusinessModel.findOne({ name: 'Al-Baraka Halal Provisions' });
  if (!biz) {
    biz = await BusinessModel.create({
      name: 'Al-Baraka Halal Provisions',
      category: 'WHOLESALE_GROCERY',
      description: 'Community wholesale grocer providing subsidized rice, grains, and olive oil to registered kitchens.',
      location: 'Central Market St, Bayt 14',
      contactEmail: 'baraka.halal@example.org',
      contactPhone: '+964 770 987 6543',
      participationTypes: ['MEAL_SUPPORT', 'SURPLUS_FOOD', 'IN_KIND'],
      status: 'ACTIVE',
      verificationStatus: VerificationStatus.APPROVED,
      ownerId: createdUsers['user@alhusseiniya.org'].id,
    });

    await BizPartModel.create({
      businessId: biz.id,
      participationType: 'MEAL_SUPPORT',
      description: 'Pledge of 500 hot meal rations per month for local relief soup kitchens.',
      quantity: 500,
      status: 'APPROVED',
      submittedById: createdUsers['user@alhusseiniya.org'].id,
      reviewedById: createdUsers['admin@alhusseiniya.org'].id,
      notes: 'Verified partner merchant contribution',
    });
  }

  console.log('[Seed] Seeding Food Program...');
  let foodProg = await FoodModel.findOne({ title: 'Daily Community Iftar & Dinner Rations' });
  if (!foodProg) {
    foodProg = await FoodModel.create({
      organizationId: org.id,
      title: 'Daily Community Iftar & Dinner Rations',
      description: 'Prepared hot meals and dry ration boxes distributed daily with dignified, contactless vouchers.',
      location: 'Distribution Pavilion 4, Karbala Outskirts',
      programDate: new Date().toISOString().split('T')[0],
      startTime: '17:30',
      endTime: '20:30',
      capacity: 350,
      remainingCapacity: 180,
      status: ProgramStatus.ACTIVE,
      instructions: 'Please present your private digital token at pickup window 2.',
    });
  }

  console.log('[Seed] Seeding Humanitarian Request (Private)...');
  let req = await RequestModel.findOne({ title: 'Emergency Food Basket for Elderly Household' });
  if (!req) {
    req = await RequestModel.create({
      requesterId: createdUsers['user@alhusseiniya.org'].id,
      organizationId: org.id,
      matchedOrganizationId: org.id,
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
      capacity: 40,
      registrationCount: 1,
      registrationRequired: true,
      format: 'ON_SITE',
      language: 'en',
      status: 'PUBLISHED',
    });

    await EventRegModel.create({
      eventId: event.id,
      userId: createdUsers['volunteer@alhusseiniya.org'].id,
      status: 'CONFIRMED',
      notes: 'Available for both setup and breakdown shifts.',
      registeredAt: new Date(),
    });
  }

  console.log('[Seed] Seeding Contributor Profile & Knowledge...');
  let contrib = await ContribModel.findOne({ userId: createdUsers['contributor@alhusseiniya.org'].id });
  if (!contrib) {
    contrib = await ContribModel.create({
      userId: createdUsers['contributor@alhusseiniya.org'].id,
      contributorType: ContributorType.SCHOLAR,
      biography: 'Specialist in ethical philosophy and community service traditions with over 15 years of academic engagement.',
      verificationStatus: VerificationStatus.APPROVED,
      reviewStatus: ContributorReviewStatus.APPROVED,
      visibility: true,
      reviewerId: createdUsers['admin@alhusseiniya.org'].id,
      reviewedAt: new Date(),
    });
  }

  // Published article 1
  let knowledgePub = await KnowledgeModel.findOne({ title: 'Service as Worship: Karbala and the Humanitarian Imperative' });
  if (!knowledgePub) {
    await KnowledgeModel.create({
      title: 'Service as Worship: Karbala and the Humanitarian Imperative',
      summary: 'An exploration of how the stance at Karbala provides a universal framework for standing with the oppressed and hungry.',
      body: `The events of Karbala are not merely a historical commemoration; they establish a continuous moral duty. Imam Hussain (AS) stood for human dignity, justice, and the defense of the vulnerable. 
      
In contemporary practice, this legacy lives through active solidarity: providing clean water to communities, distributing warm nourishment without condescension, and creating institutions that protect widows, orphans, and destitute families. 
      
Year-round service honors the sacred covenant that no person should sleep hungry in a community that remembers Ashura.`,
      contributorId: createdUsers['contributor@alhusseiniya.org'].id,
      category: 'ETHICS_AND_THEOLOGY',
      language: 'en',
      reviewStatus: ContributorReviewStatus.APPROVED,
      publicationStatus: ContentPublicationStatus.PUBLISHED,
      reviewerId: createdUsers['admin@alhusseiniya.org'].id,
      publishedAt: new Date(Date.now() - 86400000 * 5),
    });
  }

  // Published article 2 (Arabic)
  let knowledgeAr = await KnowledgeModel.findOne({ title: 'قِيَمُ العَطاء: الدَّيمومة الإنسانية في سيرة أهل البيت' });
  if (!knowledgeAr) {
    await KnowledgeModel.create({
      title: 'قِيَمُ العَطاء: الدَّيمومة الإنسانية في سيرة أهل البيت',
      summary: 'دراسة في فلسفة الإيثار وخدمة المحتاجين المستمرة على مدار العام.',
      body: `إن رسالة كربلاء تتجاوز الأبعاد الزمنية للمواسم الدينية؛ إنها دعوة دائمة لإحقاق الحق وإعانة الضعفاء وإطعام الجياع وحفظ كرامة الإنسان.
      
ومن هذا المنطلق، تشكل منصة الحسينية جسراً تقنياً ومجتمعياً يربط المتطوعين والمؤسسات لتقديم يد العون في كل يوم من أيام السنة.`,
      contributorId: createdUsers['contributor@alhusseiniya.org'].id,
      category: 'COMMUNITY_ETHICS',
      language: 'ar',
      reviewStatus: ContributorReviewStatus.APPROVED,
      publicationStatus: ContentPublicationStatus.PUBLISHED,
      reviewerId: createdUsers['admin@alhusseiniya.org'].id,
      publishedAt: new Date(Date.now() - 86400000 * 2),
    });
  }

  // Draft article
  let knowledgeDraft = await KnowledgeModel.findOne({ title: 'Preserving Dignity in Direct Charity Delivery' });
  if (!knowledgeDraft) {
    await KnowledgeModel.create({
      title: 'Preserving Dignity in Direct Charity Delivery',
      summary: 'Guidelines on ensuring privacy and respecting applicant self-worth during aid distribution.',
      body: 'When extending aid, the giver must never compromise the dignity of the receiver. Private intake workflows are essential...',
      contributorId: createdUsers['contributor@alhusseiniya.org'].id,
      category: 'PRACTICAL_GUIDES',
      language: 'en',
      reviewStatus: ContributorReviewStatus.UNDER_ADMIN_REVIEW,
      publicationStatus: ContentPublicationStatus.UNDER_REVIEW,
    });
  }

  console.log('[Seed] Seeding Volunteer Opportunity & Profile...');
  let volProfile = await VolProfileModel.findOne({ userId: createdUsers['volunteer@alhusseiniya.org'].id });
  if (!volProfile) {
    volProfile = await VolProfileModel.create({
      userId: createdUsers['volunteer@alhusseiniya.org'].id,
      skills: ['Logistics', 'Driving', 'Translation (Arabic/English)', 'First Aid'],
      interests: ['Food Distribution', 'Elderly Care', 'Event Support'],
      availability: 'Weekends & Friday afternoons',
      location: 'Central District',
      languages: ['en', 'ar'],
      preferredCategories: ['COMMUNITY_SERVICE', 'FOOD_DISTRIBUTION'],
      emergencyContact: '+964 780 999 1122',
      status: 'ACTIVE',
    });
  }

  let volOpp = await VolOppModel.findOne({ title: 'Food Distribution Helpers Needed' });
  if (!volOpp) {
    volOpp = await VolOppModel.create({
      organizationId: org.id,
      title: 'Food Distribution Helpers Needed',
      description: 'Seeking 8 volunteers to assist in packaging, checking lists and handing out meal kits.',
      location: 'Community Hall 1, Main Plaza',
      category: 'FOOD_DISTRIBUTION',
      remoteType: 'ON_SITE',
      startAt: new Date(Date.now() + 86400000 * 2),
      endAt: new Date(Date.now() + 86400000 * 2 + 14400000),
      requirements: ['Punctual', 'Ability to lift 10kg boxes', 'Friendly demeanor'],
      capacity: 8,
      status: 'OPEN',
    });

    await VolAppModel.create({
      opportunityId: volOpp.id,
      userId: createdUsers['volunteer@alhusseiniya.org'].id,
      status: 'PENDING',
      message: 'I have experience with inventory packing and speak fluent Arabic and English.',
      appliedAt: new Date(),
    });
  }

  console.log('[Seed] Seeding Moderation Report...');
  let report = await ReportModel.findOne({ reason: 'Disputed Merchant Operating Hours' });
  if (!report) {
    await ReportModel.create({
      reporterId: createdUsers['user@alhusseiniya.org'].id,
      targetType: ReportTargetType.BUSINESS,
      targetId: biz.id,
      reason: 'Disputed Merchant Operating Hours',
      description: 'The listed grocery was closed during the stated voucher redemption window on Tuesday morning.',
      status: ReportStatus.SUBMITTED,
    });
  }

  console.log('[Seed] Seeding Notifications...');
  let notif = await NotificationModel.findOne({ userId: createdUsers['volunteer@alhusseiniya.org'].id });
  if (!notif) {
    await NotificationModel.create({
      userId: createdUsers['volunteer@alhusseiniya.org'].id,
      type: 'event.registration.confirmed',
      title: 'Orientation Confirmed',
      body: 'Your registration for Volunteer Orientation & Winter Aid Planning has been recorded.',
      referenceType: 'EVENT',
      referenceId: event.id,
      readAt: null,
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

  console.log('[Seed] Seeding Faeda Parent Company and Products...');
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
  } else {
    await CompanyModel.updateOne(
      { slug: 'faeda' },
      {
        $set: {
          description: {
            ar: 'منظومة تقنية تطوّر منصات رقمية لخدمة المجتمع، وتسهّل وصول الناس إلى الدعم الإنساني والفرص المهنية.',
            en: 'A technology group building practical digital platforms that serve communities, connecting people to relief, care, and career opportunities.',
          },
          shortDescription: {
            ar: 'منصات رقمية لخدمة المجتمع',
            en: 'Community and career platforms',
          },
        },
      },
    );
  }

  // 1. Al-Husseiniya (Featured, current product)
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
        logo: null,
        coverImage: null,
        website: null,
        status: 'ACTIVE',
        displayOrder: 1,
        featured: true,
      },
    },
    { upsert: true, new: true },
  );

  // 2. Faeda Jobs (Career/recruitment product)
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
        logo: null,
        coverImage: null,
        website: null,
        status: 'ACTIVE',
        displayOrder: 2,
        featured: false,
      },
    },
    { upsert: true, new: true },
  );


  console.log('[Seed] MongoDB Dev seed data successfully seeded!');
}

