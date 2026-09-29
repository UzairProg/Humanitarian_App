import request from 'supertest';
import { Application } from 'express';
import { setupTestEnvironment, teardownTestEnvironment } from './test-helper';
import { RequestStatus } from '@al-husseiniya/types';

describe('Humanitarian Request Lifecycle & State Transitions (Spec Section 9 & 28)', () => {
  let app: Application;
  let userToken: string;
  let adminToken: string;
  let orgToken: string;
  let orgId: string;
  let categoryId: string;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;

    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'user@alhusseiniya.org',
        password: 'AlHusseiniyaDev2026!',
      });
    userToken = userLogin.body.data.tokens.accessToken;

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@alhusseiniya.org',
        password: 'AlHusseiniyaDev2026!',
      });
    adminToken = adminLogin.body.data.tokens.accessToken;

    const orgLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'orgadmin@alhusseiniya.org',
        password: 'AlHusseiniyaDev2026!',
      });
    orgToken = orgLogin.body.data.tokens.accessToken;

    const orgs = await request(app).get('/api/v1/organizations');
    orgId = orgs.body.data[0]._id;

    const cats = await request(app).get('/api/v1/requests/categories');
    categoryId = cats.body.data[0]._id;
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  it('should REJECT illegal transition jumping directly from SUBMITTED to COMPLETED (Spec Section 9)', async () => {
    const createRes = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        categoryId,
        title: 'Emergency Aid Request State Check',
        description: 'Testing illegal jump transitions',
        location: 'Sector 5',
      });

    const requestId = createRes.body.data.id;

    // Organization staff attempts to jump directly from SUBMITTED to COMPLETED
    const jumpRes = await request(app)
      .patch(`/api/v1/requests/${requestId}/status`)
      .set('Authorization', `Bearer ${orgToken}`)
      .send({ status: RequestStatus.COMPLETED })
      .expect(400);

    expect(jumpRes.body.success).toBe(false);
    expect(jumpRes.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });

  it('should allow user to cancel their own submitted request', async () => {
    const createRes = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        categoryId,
        title: 'Request to be cancelled',
        description: 'Requester cancellation test',
        location: 'Sector 5',
      });

    const requestId = createRes.body.data.id;

    const cancelRes = await request(app)
      .patch(`/api/v1/requests/${requestId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: RequestStatus.CANCELLED, reason: 'Assistance no longer needed' })
      .expect(200);

    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.data.status).toBe(RequestStatus.CANCELLED);
  });

  it('should BLOCK user from transitioning their own request to ACCEPTED or COMPLETED', async () => {
    const createRes = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        categoryId,
        title: 'Self-approval Prevention Test',
        description: 'Requester cannot self-approve',
        location: 'Sector 5',
      });

    const requestId = createRes.body.data.id;

    const illegalRes = await request(app)
      .patch(`/api/v1/requests/${requestId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: RequestStatus.ACCEPTED })
      .expect(403);

    expect(illegalRes.body.success).toBe(false);
  });
});
