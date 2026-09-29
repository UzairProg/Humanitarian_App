import { Router } from 'express';
import { organizationsController } from './organizations.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { RoleType } from '@al-husseiniya/types';

const router = Router();

// Public organization discovery
router.get('/', (req, res, next) => organizationsController.list(req, res, next));
router.get('/:id', (req, res, next) => organizationsController.getById(req, res, next));

// Protected operations
router.post('/', authenticateJwt, (req, res, next) =>
  organizationsController.create(req, res, next),
);
router.patch(
  '/:id/verify',
  authenticateJwt,
  requireRoles(RoleType.ADMIN, RoleType.SUPER_ADMIN),
  (req, res, next) => organizationsController.verify(req, res, next),
);
router.get('/:id/dashboard', authenticateJwt, (req, res, next) =>
  organizationsController.getDashboard(req, res, next),
);
router.get('/:id/members', authenticateJwt, (req, res, next) =>
  organizationsController.getMembers(req, res, next),
);
router.post('/:id/members', authenticateJwt, (req, res, next) =>
  organizationsController.addMember(req, res, next),
);

export const organizationsRouter = router;
