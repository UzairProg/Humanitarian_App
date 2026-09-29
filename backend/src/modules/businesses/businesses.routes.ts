import { Router } from 'express';
import { businessesController } from './businesses.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';
import { requirePermissions } from '../../middleware/rbac.middleware';
import { PermissionKey } from '@al-husseiniya/types';

const router = Router();

// Public discovery
router.get('/', (req, res, next) => businessesController.list(req, res, next));
router.get('/:id', (req, res, next) =>
  businessesController.getById(req, res, next),
);

// Protected routes
router.use(authenticateJwt);

router.post('/', (req, res, next) =>
  businessesController.create(req, res, next),
);
router.patch('/:id', (req, res, next) =>
  businessesController.update(req, res, next),
);

// Business Verification (Requires BUSINESS_VERIFY)
router.post(
  '/:id/verify',
  requirePermissions(PermissionKey.BUSINESS_VERIFY),
  (req, res, next) => businessesController.verify(req, res, next),
);

// Community Participation
router.get('/:id/participations', (req, res, next) =>
  businessesController.listParticipations(req, res, next),
);
router.post('/:id/participations', (req, res, next) =>
  businessesController.createParticipation(req, res, next),
);
router.patch('/participations/:participationId/status', (req, res, next) =>
  businessesController.updateParticipationStatus(req, res, next),
);

export const businessesRouter = router;
