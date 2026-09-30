import request from 'supertest';
import { Application } from 'express';
import { setupTestEnvironment, teardownTestEnvironment } from './test-helper';

describe('Faeda Parent Company & Product Ecosystem Integration Tests', () => {
  let app: Application;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  describe('GET /api/v1/company', () => {
    it('should return Faeda as the primary parent company with bilingual fields', async () => {
      const res = await request(app).get('/api/v1/company');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const company = res.body.data;
      expect(company.slug).toBe('faeda');
      expect(company.name.ar).toBe('فائدة');
      expect(company.name.en).toBe('Faeda');
      expect(company.status).toBe('ACTIVE');
      expect(company.description.ar).toBeDefined();
      expect(company.description.en).toBeDefined();

      // Ensure no Fyna references exist
      const rawText = JSON.stringify(res.body);
      expect(rawText.toLowerCase()).not.toContain('fyna');
    });
  });

  describe('GET /api/v1/company/products', () => {
    it('should return the ecosystem products linked to Faeda (Al-Husseiniya and Faeda Jobs)', async () => {
      const res = await request(app).get('/api/v1/company/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const products = res.body.data;
      expect(products.length).toBe(2);

      const slugs = products.map((p: any) => p.slug);
      expect(slugs).toContain('al-husseiniya');
      expect(slugs).toContain('faeda-jobs');

      // Verify Al-Husseiniya product
      const husseiniya = products.find((p: any) => p.slug === 'al-husseiniya');
      expect(husseiniya).toBeDefined();
      expect(husseiniya.name.ar).toBe('منصة الحسينية');
      expect(husseiniya.featured).toBe(true);
      expect(husseiniya.displayOrder).toBe(1);

      // Verify Faeda Jobs product
      const faedaJobs = products.find((p: any) => p.slug === 'faeda-jobs');
      expect(faedaJobs).toBeDefined();
      expect(faedaJobs.name.en).toBe('Faeda Jobs');
      expect(faedaJobs.displayOrder).toBe(2);

      // Verify both products have companyId
      expect(husseiniya.companyId).toBeDefined();
      expect(faedaJobs.companyId).toBe(husseiniya.companyId);

      // Ensure no Fyna references exist
      const rawText = JSON.stringify(res.body);
      expect(rawText.toLowerCase()).not.toContain('fyna');
    });
  });

  describe('GET /api/v1/company/products/:slug', () => {
    it('should return product details for al-husseiniya', async () => {
      const res = await request(app).get('/api/v1/company/products/al-husseiniya');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('al-husseiniya');
      expect(res.body.data.featured).toBe(true);
    });

    it('should return product details for faeda-jobs', async () => {
      const res = await request(app).get('/api/v1/company/products/faeda-jobs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('faeda-jobs');
    });

    it('should return 404 for unknown product slug', async () => {
      const res = await request(app).get('/api/v1/company/products/non-existent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });
});
