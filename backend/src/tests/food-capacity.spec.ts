import request from 'supertest';
import { Application } from 'express';
import { setupTestEnvironment, teardownTestEnvironment } from './test-helper';
import { ProgramStatus } from '@al-husseiniya/types';

describe('Food Capacity & Concurrency (Spec Section 16 & 45)', () => {
  let app: Application;
  let userToken: string;
  let orgToken: string;
  let orgId: string;
  let testProgramId: string;

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

    const orgLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'orgadmin@alhusseiniya.org',
        password: 'AlHusseiniyaDev2026!',
      });
    orgToken = orgLogin.body.data.tokens.accessToken;

    const orgs = await request(app).get('/api/v1/organizations');
    orgId = orgs.body.data[0]._id;

    // Create a program with exact capacity of 5 meals
    const progRes = await request(app)
      .post('/api/v1/food-programs')
      .set('Authorization', `Bearer ${orgToken}`)
      .send({
        organizationId: orgId,
        title: 'Limited Capacity Meal Kit',
        description: 'Carefully measured meal kits for testing concurrency.',
        location: 'Kitchen Station 2',
        programDate: '2026-10-15',
        startTime: '11:00',
        endTime: '13:00',
        capacity: 5,
      });

    testProgramId = progRes.body.data.id;
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  it('should allow valid reservation and decrement remaining capacity atomically', async () => {
    const res = await request(app)
      .post(`/api/v1/food-programs/${testProgramId}/reserve`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ count: 2 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.remainingCapacity).toBe(3);
  });

  it('should reject reservations exceeding remaining capacity without negative capacity', async () => {
    // Current remaining is 3. Attempting to reserve 4 should fail cleanly
    const res = await request(app)
      .post(`/api/v1/food-programs/${testProgramId}/reserve`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ count: 4 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INSUFFICIENT_CAPACITY');

    // Verify remainingCapacity is still 3
    const checkRes = await request(app)
      .get(`/api/v1/food-programs/${testProgramId}`)
      .expect(200);

    expect(checkRes.body.data.remainingCapacity).toBe(3);
  });

  it('should mark status as FULL when remaining capacity reaches 0', async () => {
    // Reserve remaining 3
    const res = await request(app)
      .post(`/api/v1/food-programs/${testProgramId}/reserve`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ count: 3 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.remainingCapacity).toBe(0);
    expect(res.body.data.status).toBe(ProgramStatus.FULL);
  });

  it('should reject further reservations when capacity is exhausted', async () => {
    const res = await request(app)
      .post(`/api/v1/food-programs/${testProgramId}/reserve`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ count: 1 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INSUFFICIENT_CAPACITY');
  });
});
