import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { RoleType } from '@al-husseiniya/types';

const router = Router();

router.use(authenticateJwt);

router.post('/', (req, res, next) => reportsController.create(req, res, next));

router.get(
  '/',
  requireRoles(RoleType.MODERATOR, RoleType.ADMIN, RoleType.SUPER_ADMIN),
  (req, res, next) => reportsController.list(req, res, next),
);

router.get(
  '/:id',
  requireRoles(RoleType.MODERATOR, RoleType.ADMIN, RoleType.SUPER_ADMIN),
  (req, res, next) => reportsController.getById(req, res, next),
);

// Support both POST and PATCH for resolution
router.post(
  '/:id/resolve',
  requireRoles(RoleType.MODERATOR, RoleType.ADMIN, RoleType.SUPER_ADMIN),
  (req, res, next) => reportsController.resolve(req, res, next),
);
router.patch(
  '/:id/resolve',
  requireRoles(RoleType.MODERATOR, RoleType.ADMIN, RoleType.SUPER_ADMIN),
  (req, res, next) => reportsController.resolve(req, res, next),
);

export const reportsRouter = router;
