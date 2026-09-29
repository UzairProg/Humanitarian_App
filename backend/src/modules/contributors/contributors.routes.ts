import { Router } from 'express';
import { contributorsController } from './contributors.controller';
import { authenticateJwt, optionalAuth } from '../../middleware/auth.middleware';
import { requirePermissions } from '../../middleware/rbac.middleware';
import { PermissionKey } from '@al-husseiniya/types';

const router = Router();

// Public discovery
router.get('/', (req, res, next) => contributorsController.list(req, res, next));
router.get('/:id', optionalAuth, (req, res, next) =>
  contributorsController.getById(req, res, next),
);

// Protected routes
router.use(authenticateJwt);

router.post('/apply', (req, res, next) =>
  contributorsController.apply(req, res, next),
);
router.get('/profile/me', (req, res, next) =>
  contributorsController.getMyProfile(req, res, next),
);

// Review contributor application
router.post(
  '/:id/review',
  requirePermissions(PermissionKey.CONTRIBUTOR_REVIEW),
  (req, res, next) => contributorsController.review(req, res, next),
);

export const contributorsRouter = router;
