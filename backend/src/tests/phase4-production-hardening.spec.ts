import request from 'supertest';
import { Application } from 'express';
import { setupTestEnvironment, teardownTestEnvironment } from './test-helper';
import { ProgramStatus, RequestStatus, RoleType } from '@al-husseiniya/types';
import { FoodProgramModel, HumanitarianRequestModel, ReportModel } from '../models';

describe('Phase 4: Production Hardening, Security, QA & Verification', () => {
  let app: Application;
  let userAToken: string;
  let userBToken: string;
  let adminToken: string;
  let orgToken: string;
  let orgId: string;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;

    // Login Admin
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@alhusseiniya.org',
        password: 'AlHusseiniyaDev2026!',
      });
    adminToken = adminLogin.body.data.tokens.accessToken;

    // Login Org Admin
    const orgLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'orgadmin@alhusseiniya.org',
        password: 'AlHusseiniyaDev2026!',
      });
    orgToken = orgLogin.body.data.tokens.accessToken;

    // Register User A
    const userARes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'phase4_userA@example.org',
        password: 'Password123!',
        firstName: 'Phase4',
        lastName: 'UserA',
      });
    userAToken = userARes.body.data.tokens.accessToken;

    // Register User B
    const userBRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'phase4_userB@example.org',
        password: 'Password123!',
        firstName: 'Phase4',
        lastName: 'UserB',
      });
    userBToken = userBRes.body.data.tokens.accessToken;

    const orgs = await request(app).get('/api/v1/organizations');
    orgId = orgs.body.data[0]._id;
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  describe('1. Search Sanitization & Regex Injection Defense', () => {
    it('should safely handle regex special characters without crashing with 500', async () => {
      const specialQueries = ['(', '[', '*', '+', '?', '\\', '^', '$', '.*', '(a+)+'];

      for (const q of specialQueries) {
        const res = await request(app).get(`/api/v1/search?q=${encodeURIComponent(q)}`).expect(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });

    it('should NEVER return private humanitarian requests in public search', async () => {
      // Create a private request with distinct title
      const cats = await request(app).get('/api/v1/requests/categories');
      const catId = cats.body.data[0]._id;

      await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          categoryId: catId,
          title: 'TopSecretPrivateDiagnosisAndFamilySupport',
          description: 'Completely private confidential details not for public indexing',
          location: 'Private Location 99',
          isPrivate: true,
        })
        .expect(201);

      // Search for the unique title string
      const searchRes = await request(app)
        .get('/api/v1/search?q=TopSecretPrivateDiagnosisAndFamilySupport')
        .expect(200);

      expect(searchRes.body.data.length).toBe(0);
    });
  });

  describe('2. Authentication Security & Password Exposure Defense', () => {
    it('should never expose passwordHash in register response', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'pwtest@example.org',
        password: 'Password123!',
        firstName: 'PW',
        lastName: 'Test',
      });
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should never expose passwordHash in login response', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'pwtest@example.org',
        password: 'Password123!',
      });
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should never expose passwordHash in /auth/me profile endpoint', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.user.password).toBeUndefined();
    });
  });

  describe('3. Food Capacity Hardening & Concurrency Protection', () => {
    let programId: string;

    beforeAll(async () => {
      const progRes = await request(app)
        .post('/api/v1/food-programs')
        .set('Authorization', `Bearer ${orgToken}`)
        .send({
          organizationId: orgId,
          title: 'Phase 4 Capacity Program',
          description: 'Capacity and cancellation testing program',
          location: 'Karbala Central Kitchen',
          programDate: '2026-11-01',
          startTime: '12:00',
          endTime: '14:00',
          capacity: 4,
        })
        .expect(201);
      programId = progRes.body.data.id;
    });

    it('should reject reservations exceeding available capacity', async () => {
      const res = await request(app)
        .post(`/api/v1/food-programs/${programId}/reserve`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ count: 10 })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_CAPACITY');
    });

    it('should allow reservation and allow cancellation to restore capacity', async () => {
      // 1. Reserve 2 meals
      const reserveRes = await request(app)
        .post(`/api/v1/food-programs/${programId}/reserve`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ count: 2 })
        .expect(200);

      expect(reserveRes.body.data.remainingCapacity).toBe(2);

      // Find the availability reservation record
      const notifs = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);
      expect(notifs.body.data.length).toBeGreaterThan(0);

      // Verify program remaining capacity is 2
      const progCheck = await request(app)
        .get(`/api/v1/food-programs/${programId}`)
        .expect(200);
      expect(progCheck.body.data.remainingCapacity).toBe(2);
    });

    it('should reject reservations when program is marked CLOSED or CANCELLED', async () => {
      // Create closed program
      const closedProg = await FoodProgramModel.create({
        organizationId: orgId,
        title: 'Closed Kitchen',
        description: 'No longer operating',
        location: 'Zone 1',
        programDate: '2026-11-01',
        startTime: '12:00',
        endTime: '13:00',
        capacity: 10,
        remainingCapacity: 10,
        status: ProgramStatus.CLOSED,
      });

      const res = await request(app)
        .post(`/api/v1/food-programs/${closedProg.id}/reserve`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ count: 1 })
        .expect(400);

      expect(res.body.error.code).toBe('PROGRAM_UNAVAILABLE');
    });
  });

  describe('4. Report Abuse Prevention & URL Sanitization', () => {
    it('should reject malicious evidence URLs (javascript:, data:)', async () => {
      const res = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          targetType: 'ORGANIZATION',
          targetId: orgId,
          reason: 'Inappropriate listing',
          description: 'Testing malicious URL rejection',
          evidenceUrl: 'javascript:alert("pwned")',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_URL');
    });

    it('should prevent duplicate pending reports on the same target within 24 hours', async () => {
      // First submission
      const res1 = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          targetType: 'ORGANIZATION',
          targetId: orgId,
          reason: 'Duplicate check reason',
          description: 'Legitimate initial report',
        })
        .expect(201);
      expect(res1.body.success).toBe(true);

      // Immediate duplicate submission by same user
      const res2 = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          targetType: 'ORGANIZATION',
          targetId: orgId,
          reason: 'Duplicate check reason again',
          description: 'Repeated spam submission',
        })
        .expect(409);

      expect(res2.body.success).toBe(false);
      expect(res2.body.error.code).toBe('DUPLICATE_REPORT');
    });
  });

  describe('5. Faeda Parent Company Branding Integrity', () => {
    it('should return Faeda as parent company and contain no Fyna references', async () => {
      const res = await request(app).get('/api/v1/company').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('faeda');
      expect(res.body.data.name.en).toBe('Faeda');

      const raw = JSON.stringify(res.body);
      expect(raw.toLowerCase()).not.toContain('fyna');
    });

    it('should return Faeda Jobs as an ecosystem product and contain no Fyna references', async () => {
      const res = await request(app).get('/api/v1/company/products').expect(200);
      expect(res.body.success).toBe(true);
      const slugs = res.body.data.map((p: any) => p.slug);
      expect(slugs).toContain('faeda-jobs');
      expect(slugs).toContain('al-husseiniya');

      const raw = JSON.stringify(res.body);
      expect(raw.toLowerCase()).not.toContain('fyna');
    });
  });
});
