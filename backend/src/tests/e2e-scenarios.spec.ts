import request from 'supertest';
import { Application } from 'express';
import { setupTestEnvironment, teardownTestEnvironment } from './test-helper';
import { RequestStatus, RoleType } from '@al-husseiniya/types';

describe('Phase 2 E2E Scenarios (Strict MERN)', () => {
  let app: Application;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  describe('CRITICAL E2E SCENARIO 1: INDIVIDUAL USER FLOW (Spec Section 48)', () => {
    let userToken: string;
    let categoryId: string;
    let createdRequestId: string;

    it('Step 1: User Login with verified seed account', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@alhusseiniya.org',
          password: 'AlHusseiniyaDev2026!',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('user@alhusseiniya.org');
      userToken = res.body.data.tokens.accessToken;
    });

    it('Step 2: Home / Platform Summary discovery', async () => {
      const res = await request(app).get('/api/v1/impact/summary').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mealsDistributed).toBeGreaterThanOrEqual(0);
      expect(res.body.data.verifiedOrganizations).toBeGreaterThanOrEqual(1);
    });

    it('Step 3: Find Help / Discover Categories', async () => {
      const res = await request(app).get('/api/v1/requests/categories').expect(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      categoryId = res.body.data[0]._id;
    });

    it('Step 4: Food Near Me / Discover Available Programs', async () => {
      const res = await request(app).get('/api/v1/food-programs').expect(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const program = res.body.data[0];
      expect(program.remainingCapacity).toBeGreaterThan(0);
    });

    it('Step 5: Open Organization Profile & Public Information', async () => {
      const orgsRes = await request(app).get('/api/v1/organizations').expect(200);
      expect(orgsRes.body.data.length).toBeGreaterThanOrEqual(1);
      const orgId = orgsRes.body.data[0]._id;

      const profileRes = await request(app).get(`/api/v1/organizations/${orgId}`).expect(200);
      expect(profileRes.body.success).toBe(true);
      expect(profileRes.body.data.name).toBeDefined();
      expect(profileRes.body.data.activeFoodPrograms).toBeDefined();
      expect(profileRes.body.data.upcomingEvents).toBeDefined();
    });

    it('Step 6: Submit Confidential Humanitarian Request', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          categoryId,
          title: 'Elderly Nutrition Package Request',
          description: 'Nutritious grocery basket needed for elderly couple with limited mobility.',
          location: 'District 4, Community Block B',
          priority: 'NORMAL',
          isPrivate: true,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.status).toBe(RequestStatus.SUBMITTED);
      createdRequestId = res.body.data.id;
    });

    it('Step 7: View My Requests and verify SUBMITTED state + notifications', async () => {
      const listRes = await request(app)
        .get('/api/v1/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(listRes.body.success).toBe(true);
      const myReq = listRes.body.data.find((r: any) => r._id === createdRequestId);
      expect(myReq).toBeDefined();
      expect(myReq.status).toBe(RequestStatus.SUBMITTED);

      // Verify notification was sent to user
      const notifRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(notifRes.body.success).toBe(true);
      expect(notifRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(notifRes.body.data[0].type).toBe('REQUEST_SUBMITTED');
    });

    it('Step 8: Requester can view details and status timeline', async () => {
      const res = await request(app)
        .get(`/api/v1/requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.request.id).toBe(createdRequestId);
      expect(res.body.data.history.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.history[0].newStatus).toBe(RequestStatus.SUBMITTED);
    });
  });

  describe('CRITICAL E2E SCENARIO 2: ORGANIZATION FLOW (Spec Section 49)', () => {
    let orgToken: string;
    let orgId: string;
    let userToken: string;
    let categoryId: string;
    let testRequestId: string;

    beforeAll(async () => {
      // Login as organization admin
      const orgLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'orgadmin@alhusseiniya.org',
          password: 'AlHusseiniyaDev2026!',
        })
        .expect(200);
      orgToken = orgLogin.body.data.tokens.accessToken;

      // Find org ID
      const orgs = await request(app).get('/api/v1/organizations').expect(200);
      orgId = orgs.body.data[0]._id;

      // Login as normal user to submit request
      const userLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@alhusseiniya.org',
          password: 'AlHusseiniyaDev2026!',
        })
        .expect(200);
      userToken = userLogin.body.data.tokens.accessToken;

      const cats = await request(app).get('/api/v1/requests/categories').expect(200);
      categoryId = cats.body.data[0]._id;
    });

    it('Step 1: Organization Dashboard Access', async () => {
      const res = await request(app)
        .get(`/api/v1/organizations/${orgId}/dashboard`)
        .set('Authorization', `Bearer ${orgToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.organization).toBeDefined();
      expect(res.body.data.foodPrograms).toBeDefined();
      expect(res.body.data.memberCount).toBeGreaterThanOrEqual(1);
    });

    it('Step 2: Create Food Program with capacity', async () => {
      const res = await request(app)
        .post('/api/v1/food-programs')
        .set('Authorization', `Bearer ${orgToken}`)
        .send({
          organizationId: orgId,
          title: 'Weekend Hot Meals Kitchen',
          description: 'Providing hot meals to families and community members in need.',
          location: 'Community Center 3 Kitchen',
          programDate: '2026-10-05',
          startTime: '13:00',
          endTime: '16:00',
          capacity: 150,
          instructions: 'Takeaway available. Children welcomed.',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Weekend Hot Meals Kitchen');
      expect(res.body.data.remainingCapacity).toBe(150);
    });

    it('Step 3: User submits request to this organization', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          categoryId,
          organizationId: orgId,
          title: 'Family Heating & Food Support',
          description: 'Emergency assistance requested for winter heating and basic groceries.',
          location: 'East District, Block 7',
          priority: 'HIGH',
          isPrivate: true,
        })
        .expect(201);

      testRequestId = res.body.data.id;
      expect(testRequestId).toBeDefined();
    });

    it('Step 4: Organization reviews & transitions request: UNDER_REVIEW -> MATCHED -> ACCEPTED', async () => {
      // Move to UNDER_REVIEW
      await request(app)
        .patch(`/api/v1/requests/${testRequestId}/status`)
        .set('Authorization', `Bearer ${orgToken}`)
        .send({ status: RequestStatus.UNDER_REVIEW, reason: 'Initial review by relief committee' })
        .expect(200);

      // Move to MATCHED
      await request(app)
        .patch(`/api/v1/requests/${testRequestId}/status`)
        .set('Authorization', `Bearer ${orgToken}`)
        .send({ status: RequestStatus.MATCHED, matchedOrganizationId: orgId })
        .expect(200);

      // Move to ACCEPTED
      const acceptedRes = await request(app)
        .patch(`/api/v1/requests/${testRequestId}/status`)
        .set('Authorization', `Bearer ${orgToken}`)
        .send({ status: RequestStatus.ACCEPTED, reason: 'Organization accepted request' })
        .expect(200);

      expect(acceptedRes.body.data.status).toBe(RequestStatus.ACCEPTED);
    });

    it('Step 5: Organization starts assistance: IN_PROGRESS', async () => {
      const res = await request(app)
        .patch(`/api/v1/requests/${testRequestId}/status`)
        .set('Authorization', `Bearer ${orgToken}`)
        .send({ status: RequestStatus.IN_PROGRESS, reason: 'Volunteers dispatched with aid' })
        .expect(200);

      expect(res.body.data.status).toBe(RequestStatus.IN_PROGRESS);
    });

    it('Step 6: Organization completes assistance: COMPLETED and impact updates', async () => {
      const res = await request(app)
        .patch(`/api/v1/requests/${testRequestId}/status`)
        .set('Authorization', `Bearer ${orgToken}`)
        .send({ status: RequestStatus.COMPLETED, reason: 'Assistance delivered in full' })
        .expect(200);

      expect(res.body.data.status).toBe(RequestStatus.COMPLETED);

      // Verify impact aggregation updated
      const impactRes = await request(app)
        .get(`/api/v1/impact/organization/${orgId}`)
        .expect(200);

      expect(impactRes.body.success).toBe(true);
      expect(impactRes.body.data.requestsFulfilled).toBeGreaterThanOrEqual(1);
    });
  });

  describe('CRITICAL SECURITY E2E SCENARIO (Spec Section 50)', () => {
    let userAToken: string;
    let userBToken: string;
    let userARequestId: string;
    let adminToken: string;
    let orgToken: string;

    beforeAll(async () => {
      // Register User A
      const userARes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'userA_security@example.org',
          password: 'Password123!',
          firstName: 'User',
          lastName: 'Alpha',
        })
        .expect(201);
      userAToken = userARes.body.data.tokens.accessToken;

      // Register User B
      const userBRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'userB_security@example.org',
          password: 'Password123!',
          firstName: 'User',
          lastName: 'Beta',
        })
        .expect(201);
      userBToken = userBRes.body.data.tokens.accessToken;

      // Login Admin
      const adminLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@alhusseiniya.org',
          password: 'AlHusseiniyaDev2026!',
        })
        .expect(200);
      adminToken = adminLogin.body.data.tokens.accessToken;

      // Login Org Admin
      const orgLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'orgadmin@alhusseiniya.org',
          password: 'AlHusseiniyaDev2026!',
        })
        .expect(200);
      orgToken = orgLogin.body.data.tokens.accessToken;

      // User A creates a confidential request
      const cats = await request(app).get('/api/v1/requests/categories').expect(200);
      const catId = cats.body.data[0]._id;

      const reqRes = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          categoryId: catId,
          title: 'Confidential Medical Needs',
          description: 'Sensitive private diagnosis and prescription aid',
          location: 'Private Residence 10',
          isPrivate: true,
        })
        .expect(201);
      userARequestId = reqRes.body.data.id;
    });

    it('Test 1: User B CANNOT access User A private request by ID tampering', async () => {
      const res = await request(app)
        .get(`/api/v1/requests/${userARequestId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Test 2: User B CANNOT update or cancel User A request', async () => {
      const res = await request(app)
        .patch(`/api/v1/requests/${userARequestId}/status`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ status: RequestStatus.CANCELLED })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Test 3: Normal individual CANNOT publish or create an organization program', async () => {
      const orgs = await request(app).get('/api/v1/organizations').expect(200);
      const orgId = orgs.body.data[0]._id;

      const res = await request(app)
        .post('/api/v1/food-programs')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          organizationId: orgId,
          title: 'Unauthorized Food Program',
          description: 'Testing authorization boundaries',
          location: 'Unknown',
          programDate: '2026-10-10',
          startTime: '10:00',
          endTime: '12:00',
        })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Test 4: Normal user CANNOT approve organization verification', async () => {
      const orgs = await request(app).get('/api/v1/organizations').expect(200);
      const orgId = orgs.body.data[0]._id;

      const res = await request(app)
        .patch(`/api/v1/organizations/${orgId}/verify`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ status: 'APPROVED', decision: 'Illegal self-approval' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('Test 5: User CANNOT edit another user profile via ID manipulation', async () => {
      // User B tries to update User A profile
      const userAProfile = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);
      const userAId = userAProfile.body.data.user.id;

      const res = await request(app)
        .patch(`/api/v1/users/${userAId}/profile`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ firstName: 'TamperedName' })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Test 6: User CANNOT escalate their own role through profile update', async () => {
      const userAProfile = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);
      const userAId = userAProfile.body.data.user.id;

      const res = await request(app)
        .patch(`/api/v1/users/${userAId}/profile`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ roles: [RoleType.SUPER_ADMIN] })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Test 7: Unauthenticated requests to protected endpoints return 401', async () => {
      await request(app).get('/api/v1/requests').expect(401);
      await request(app).get('/api/v1/auth/me').expect(401);
      await request(app).get('/api/v1/notifications').expect(401);
    });
  });
});
