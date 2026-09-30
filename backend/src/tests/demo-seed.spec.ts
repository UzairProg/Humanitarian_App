import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { runDemoSeed, runDemoReset } from '../database/seeds/demo.seed';
import {
  UserModel,
  OrganizationModel,
  FoodProgramModel,
  HumanitarianRequestModel,
  EventModel,
  VolunteerProfileModel,
  BusinessModel,
  KnowledgeContentModel,
  NotificationModel,
  ReportModel,
} from '../models';

describe('Demo Dataset & CEO Demonstration Seed Suite', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('should seed the complete demo dataset with isDemo: true for all demo entities', async () => {
    const counts = await runDemoSeed(mongoose.connection);

    expect(counts.users).toBeGreaterThanOrEqual(8);
    expect(counts.organizations).toBe(5);
    expect(counts.foodPrograms).toBe(8);
    expect(counts.requests).toBe(6);
    expect(counts.events).toBe(6);
    expect(counts.businesses).toBe(4);
    expect(counts.knowledgeArticles).toBe(8);
    expect(counts.volunteers).toBe(6);
    expect(counts.notifications).toBeGreaterThanOrEqual(10);
    expect(counts.reports).toBe(3);

    // Verify isDemo: true on entities
    const demoUsers = await UserModel.find({ isDemo: true });
    expect(demoUsers.length).toBe(counts.users);

    const demoOrgs = await OrganizationModel.find({ isDemo: true });
    expect(demoOrgs.length).toBe(5);

    const demoPrograms = await FoodProgramModel.find({ isDemo: true });
    expect(demoPrograms.length).toBe(8);

    const demoRequests = await HumanitarianRequestModel.find({ isDemo: true });
    expect(demoRequests.length).toBe(6);

    const demoEvents = await EventModel.find({ isDemo: true });
    expect(demoEvents.length).toBe(6);

    const demoBusinesses = await BusinessModel.find({ isDemo: true });
    expect(demoBusinesses.length).toBe(4);

    const demoArticles = await KnowledgeContentModel.find({ isDemo: true });
    expect(demoArticles.length).toBe(8);

    const demoNotifications = await NotificationModel.find({ isDemo: true });
    expect(demoNotifications.length).toBe(counts.notifications);

    const demoReports = await ReportModel.find({ isDemo: true });
    expect(demoReports.length).toBe(3);
  });

  it('should be idempotent and not create duplicate records on repeated seed runs', async () => {
    const countsFirst = await runDemoSeed(mongoose.connection);
    const countsSecond = await runDemoSeed(mongoose.connection);

    expect(countsSecond.users).toBe(countsFirst.users);
    expect(countsSecond.organizations).toBe(countsFirst.organizations);
    expect(countsSecond.foodPrograms).toBe(countsFirst.foodPrograms);
    expect(countsSecond.requests).toBe(countsFirst.requests);
    expect(countsSecond.events).toBe(countsFirst.events);

    const totalOrgs = await OrganizationModel.countDocuments();
    expect(totalOrgs).toBe(5);

    const totalPrograms = await FoodProgramModel.countDocuments();
    expect(totalPrograms).toBe(8);
  });

  it('should reset only demo records (isDemo: true) and preserve unrelated non-demo data', async () => {
    // Insert non-demo user and organization
    const nonDemoUser = await UserModel.create({
      email: 'production.user@realorg.org',
      passwordHash: 'someSecureHash123!',
      firstName: 'Real',
      lastName: 'User',
      isDemo: false,
    });

    const nonDemoOrg = await OrganizationModel.create({
      name: 'Actual Production Entity',
      slug: 'actual-production-entity',
      description: 'A genuine operational partner',
      location: 'Central District',
      contactEmail: 'contact@realorg.org',
      createdById: nonDemoUser.id,
      isDemo: false,
    });

    // Run demo reset
    const resetCounts = await runDemoReset(mongoose.connection);

    expect(resetCounts.users).toBeGreaterThanOrEqual(8);
    expect(resetCounts.organizations).toBe(5);

    // Non-demo records must still exist!
    const foundNonDemoUser = await UserModel.findOne({ email: 'production.user@realorg.org' });
    expect(foundNonDemoUser).not.toBeNull();
    expect(foundNonDemoUser?.isDemo).toBe(false);

    const foundNonDemoOrg = await OrganizationModel.findOne({ slug: 'actual-production-entity' });
    expect(foundNonDemoOrg).not.toBeNull();
    expect(foundNonDemoOrg?.isDemo).toBe(false);

    // Clean up non-demo test records
    await UserModel.deleteOne({ _id: nonDemoUser._id });
    await OrganizationModel.deleteOne({ _id: nonDemoOrg._id });
  });

  it('should verify demo account password authentication works with DemoPass@12345', async () => {
    const bcrypt = await import('bcryptjs');
    const demoAdmin = await UserModel.findOne({ email: 'demo.admin@demo.alhusseiniya.app' }).select('+passwordHash');
    expect(demoAdmin).not.toBeNull();
    const matches = await bcrypt.compare('DemoPass@12345', demoAdmin!.passwordHash);
    expect(matches).toBe(true);

    const demoRequester = await UserModel.findOne({ email: 'demo.requester@demo.alhusseiniya.app' }).select('+passwordHash');
    expect(demoRequester).not.toBeNull();
    const reqMatches = await bcrypt.compare('DemoPass@12345', demoRequester!.passwordHash);
    expect(reqMatches).toBe(true);
  });
});
