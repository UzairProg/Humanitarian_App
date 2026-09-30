import { Router } from 'express';
import { companyController } from './company.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { RoleType } from '@al-husseiniya/types';

const router = Router();

// Public Endpoints
router.get('/', (req, res, next) => companyController.getCompany(req, res, next));
router.get('/products', (req, res, next) => companyController.getProducts(req, res, next));
router.get('/products/:slug', (req, res, next) => companyController.getProductBySlug(req, res, next));

// Admin Endpoints
router.put(
  '/',
  authenticateJwt,
  requireRoles(RoleType.ADMIN, RoleType.SUPER_ADMIN),
  (req, res, next) => companyController.updateCompany(req, res, next),
);

router.post(
  '/products',
  authenticateJwt,
  requireRoles(RoleType.ADMIN, RoleType.SUPER_ADMIN),
  (req, res, next) => companyController.upsertProduct(req, res, next),
);

export const companyRouter = router;
