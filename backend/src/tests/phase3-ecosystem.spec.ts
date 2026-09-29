import request from 'supertest';
import { Application } from 'express';
import { setupTestEnvironment, teardownTestEnvironment } from './test-helper';
import {
  VerificationStatus,
  ContributorReviewStatus,
  ContentPublicationStatus,
  ReportStatus,
} from '@al-husseiniya/types';

describe('Phase 3 Full Community Ecosystem (Strict MERN)', () => {
  let app: Application;
  let adminToken: string;
  let orgAdminToken: string;
  let moderatorToken: string;
  let contributorToken: string;
  let volunteerToken: string;
  let userToken: string;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;

    // Login all personas
    const login = async (email: string) => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'AlHusseiniyaDev2026!' });
      return res.body.data.tokens.accessToken;
    };

    adminToken = await login('admin@alhusseiniya.org');
    orgAdminToken = await login('orgadmin@alhusseiniya.org');
    moderatorToken = await login('moderator@alhusseiniya.org');
    contributorToken = await login('contributor@alhusseiniya.org');
    volunteerToken = await login('volunteer@alhusseiniya.org');
    userToken = await login('user@alhusseiniya.org');
  }, 180000);

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  // ==========================================================================
  // FLOW 1: VOLUNTEER ECOSYSTEM
  // ==========================================================================
  describe('FLOW 1: Volunteer Ecosystem (Opportunities, Profiles, Applications)', () => {
    let opportunityId: string;
    let applicationId: string;

    it('Step 1: Volunteer updates their service profile', async () => {
      const res = await request(app)
        .post('/api/v1/volunteers/profile')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          skills: ['Logistics', 'Driving', 'Food Packing'],
          interests: ['Food Distribution', 'Winterization'],
          availability: 'Weekends',
          location: 'East District',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.skills).toContain('Logistics');
    });

    it('Step 2: Volunteer retrieves their profile', async () => {
      const res = await request(app)
        .get('/api/v1/volunteers/profile/me')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.location).toBe('East District');
    });

    it('Step 3: Organization Admin creates a new volunteer opportunity', async () => {
      // Find org
      const orgRes = await request(app).get('/api/v1/organizations').expect(200);
      const orgId = orgRes.body.data[0].id;

      const res = await request(app)
        .post('/api/v1/volunteers/opportunities')
        .set('Authorization', `Bearer ${orgAdminToken}`)
        .send({
          organizationId: orgId,
          title: 'Weekend Ration Packing Helpers',
          description: 'Need volunteers to pack dry grain boxes.',
          location: 'Distribution Center 2',
          startAt: new Date(Date.now() + 86400000 * 4),
          endAt: new Date(Date.now() + 86400000 * 4 + 14400000),
          capacity: 5,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Weekend Ration Packing Helpers');
      opportunityId = res.body.data.id;
    });

    it('Step 4: Public discovery of open opportunities', async () => {
      const res = await request(app)
        .get('/api/v1/volunteers/opportunities')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('Step 5: User applies to the opportunity', async () => {
      const res = await request(app)
        .post(`/api/v1/volunteers/opportunities/${opportunityId}/apply`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ message: 'I can assist on Saturday morning.' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
      applicationId = res.body.data.id;
    });

    it('Step 6: Duplicate application is rejected with 409', async () => {
      const res = await request(app)
        .post(`/api/v1/volunteers/opportunities/${opportunityId}/apply`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ message: 'Applying again' })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DUPLICATE_APPLICATION');
    });

    it('Step 7: Organization reviews applicant list', async () => {
      const res = await request(app)
        .get(`/api/v1/volunteers/opportunities/${opportunityId}/applications`)
        .set('Authorization', `Bearer ${orgAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].applicant.email).toBe('user@alhusseiniya.org');
    });

    it('Step 8: Organization accepts the application (notifying user)', async () => {
      const res = await request(app)
        .patch(`/api/v1/volunteers/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${orgAdminToken}`)
        .send({
          status: 'ACCEPTED',
          reviewNotes: 'Welcome to the team, see you Saturday at 9 AM.',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACCEPTED');

      // Verify user received notification
      const notifRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(notifRes.body.success).toBe(true);
      const appNotif = notifRes.body.data.find(
        (n: any) => n.type === 'volunteer.application.updated',
      );
      expect(appNotif).toBeDefined();
    });
  });

  // ==========================================================================
  // FLOW 2: EVENTS & REGISTRATION ECOSYSTEM
  // ==========================================================================
  describe('FLOW 2: Events & Registration Ecosystem', () => {
    let testEventId: string;

    it('Step 1: Organization Admin creates a public event', async () => {
      const orgRes = await request(app).get('/api/v1/organizations').expect(200);
      const orgId = orgRes.body.data[0].id;

      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${orgAdminToken}`)
        .send({
          organizationId: orgId,
          title: 'Charity Food Logistics Workshop',
          description: 'Learning sanitary guidelines for mass meal preparation.',
          location: 'Main Community Pavilion',
          startAt: new Date(Date.now() + 86400000 * 5),
          endAt: new Date(Date.now() + 86400000 * 5 + 7200000),
          category: 'COMMUNITY_WORKSHOP',
          capacity: 25,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Charity Food Logistics Workshop');
      testEventId = res.body.data.id;
    });

    it('Step 2: User registers for the event', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${testEventId}/register`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ notes: 'Attending with one family member' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CONFIRMED');
    });

    it('Step 3: Duplicate event registration is prevented with 409', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${testEventId}/register`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ALREADY_REGISTERED');
    });

    it('Step 4: User inspects their registered events', async () => {
      const res = await request(app)
        .get('/api/v1/events/my/registrations')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.some((r: any) => r.eventId === testEventId)).toBe(true);
    });

    it('Step 5: User cancels registration', async () => {
      const res = await request(app)
        .delete(`/api/v1/events/${testEventId}/register`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CANCELLED');
    });
  });

  // ==========================================================================
  // FLOW 3: KNOWLEDGE PLATFORM & TRUSTED CONTRIBUTOR WORKFLOW
  // ==========================================================================
  describe('FLOW 3: Knowledge Platform & Contributor Workflow', () => {
    let articleId: string;

    it('Step 1: User applies to become a trusted contributor', async () => {
      const res = await request(app)
        .post('/api/v1/contributors/apply')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          contributorType: 'RESEARCHER',
          biography: 'Author of historical studies on Karbala social ethics.',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reviewStatus).toBe('SUBMITTED');
    });

    it('Step 2: Admin reviews and approves contributor application', async () => {
      const listRes = await request(app)
        .get('/api/v1/contributors?publicOnly=false')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const applicant = listRes.body.data.find(
        (c: any) => c.reviewStatus === 'SUBMITTED',
      );
      expect(applicant).toBeDefined();

      const res = await request(app)
        .post(`/api/v1/contributors/${applicant.id}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'APPROVED',
          notes: 'Credentials and academic publications verified.',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe(VerificationStatus.APPROVED);
    });

    it('Step 3: Contributor drafts an educational article', async () => {
      const res = await request(app)
        .post('/api/v1/knowledge')
        .set('Authorization', `Bearer ${contributorToken}`)
        .send({
          title: 'The Ethics of Neighborly Care in Islamic Tradition',
          summary: 'Why standing with neighbors in need is central to faith.',
          body: 'A deep examination of community service and humanitarian solidarity...',
          category: 'COMMUNITY_ETHICS',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.publicationStatus).toBe(ContentPublicationStatus.DRAFT);
      articleId = res.body.data.id;
    });

    it('Step 4: Contributor submits article for editorial review', async () => {
      const res = await request(app)
        .post(`/api/v1/knowledge/${articleId}/submit`)
        .set('Authorization', `Bearer ${contributorToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reviewStatus).toBe(
        ContributorReviewStatus.UNDER_ADMIN_REVIEW,
      );
    });

    it('Step 5: Non-publisher cannot publish directly (permission check)', async () => {
      // Contributor lacks CONTENT_PUBLISH permission
      const res = await request(app)
        .post(`/api/v1/knowledge/${articleId}/publish`)
        .set('Authorization', `Bearer ${contributorToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('Step 6: Moderator/Admin reviews and publishes article', async () => {
      // Review
      await request(app)
        .post(`/api/v1/knowledge/${articleId}/review`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          reviewStatus: ContributorReviewStatus.APPROVED,
          reviewNotes: 'Approved for publication.',
        })
        .expect(200);

      // Publish
      const res = await request(app)
        .post(`/api/v1/knowledge/${articleId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.publicationStatus).toBe(
        ContentPublicationStatus.PUBLISHED,
      );
    });

    it('Step 7: Article appears in public knowledge discovery', async () => {
      const res = await request(app)
        .get('/api/v1/knowledge')
        .expect(200);

      expect(res.body.success).toBe(true);
      const found = res.body.data.find((a: any) => a.id === articleId);
      expect(found).toBeDefined();
    });
  });

  // ==========================================================================
  // FLOW 4: BUSINESS PARTICIPATION & VERIFICATION
  // ==========================================================================
  describe('FLOW 4: Business Participation & Verification', () => {
    let businessId: string;
    let participationId: string;

    it('Step 1: User registers a community business', async () => {
      const res = await request(app)
        .post('/api/v1/businesses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Al-Hadi Bakeries & Flour Wholesale',
          category: 'BAKERY_WHOLESALE',
          description: 'Providing daily fresh bread at subsidized rates for charity kitchens.',
          location: 'South Bazaar, Block 5',
          contactEmail: 'alhadi.bread@example.org',
          contactPhone: '+964 770 111 2233',
          participationTypes: ['MEAL_SUPPORT', 'SURPLUS_FOOD'],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe(VerificationStatus.PENDING);
      businessId = res.body.data.id;
    });

    it('Step 2: Non-reviewer cannot verify business', async () => {
      const res = await request(app)
        .post(`/api/v1/businesses/${businessId}/verify`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: VerificationStatus.APPROVED })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('Step 3: Administrator verifies business', async () => {
      const res = await request(app)
        .post(`/api/v1/businesses/${businessId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: VerificationStatus.APPROVED,
          decision: 'Business verified through commercial license inspection.',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe(VerificationStatus.APPROVED);
    });

    it('Step 4: Verified business submits a community participation offer', async () => {
      const res = await request(app)
        .post(`/api/v1/businesses/${businessId}/participations`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          participationType: 'MEAL_SUPPORT',
          description: 'Supply of 200 fresh pita bread packs weekly.',
          quantity: 200,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SUBMITTED');
      participationId = res.body.data.id;
    });

    it('Step 5: Admin approves the participation offer', async () => {
      const res = await request(app)
        .patch(`/api/v1/businesses/participations/${participationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPROVED');
    });
  });

  // ==========================================================================
  // FLOW 5: MODERATION & TRUST-AND-SAFETY
  // ==========================================================================
  describe('FLOW 5: Moderation & Trust-and-Safety Flow', () => {
    let reportId: string;

    it('Step 1: User submits a moderation report', async () => {
      const res = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          targetType: 'BUSINESS',
          targetId: 'biz-12345',
          reason: 'Misleading contact information',
          description: 'The phone number listed belongs to an unrelated private residence.',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ReportStatus.SUBMITTED);
      reportId = res.body.data.id;
    });

    it('Step 2: Moderator views the moderation queue', async () => {
      const res = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('Step 3: Moderator resolves report with action', async () => {
      const res = await request(app)
        .post(`/api/v1/reports/${reportId}/resolve`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          status: ReportStatus.RESOLVED,
          resolution: 'Merchant owner contacted; corrected telephone number provided.',
          internalNotes: 'Verification check passed on second contact.',
          actionTaken: 'WARN_USER',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ReportStatus.RESOLVED);
    });
  });

  // ==========================================================================
  // FLOW 6: SEARCH & CROSS-PLATFORM DISCOVERY
  // ==========================================================================
  describe('FLOW 6: Unified Cross-Platform Search & Discovery', () => {
    it('Step 1: Public search for "Karbala"', async () => {
      const res = await request(app)
        .get('/api/v1/search?q=Karbala')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      // Ensure results include title, type, urlPath
      expect(res.body.data[0].type).toBeDefined();
      expect(res.body.data[0].urlPath).toBeDefined();
    });

    it('Step 2: Filtered search by category', async () => {
      const res = await request(app)
        .get('/api/v1/search?q=Food&type=volunteers')
        .expect(200);

      expect(res.body.success).toBe(true);
      for (const item of res.body.data) {
        expect(item.type).toBe('VOLUNTEER_OPPORTUNITY');
      }
    });

    it('Step 3: Search with empty query returns empty array safely', async () => {
      const res = await request(app).get('/api/v1/search?q=').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });
});
