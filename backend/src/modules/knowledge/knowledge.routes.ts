import { Router } from 'express';
import { knowledgeController } from './knowledge.controller';
import { authenticateJwt, optionalAuth } from '../../middleware/auth.middleware';
import { requirePermissions } from '../../middleware/rbac.middleware';
import { PermissionKey } from '@al-husseiniya/types';

const router = Router();

// Public discovery (optional auth to inspect own drafts)
router.get('/', (req, res, next) => knowledgeController.list(req, res, next));
router.get('/:id', optionalAuth, (req, res, next) =>
  knowledgeController.getById(req, res, next),
);

// Protected authoring and editorial routes
router.use(authenticateJwt);

router.post('/', (req, res, next) =>
  knowledgeController.create(req, res, next),
);
router.get('/my/articles', (req, res, next) =>
  knowledgeController.getMyArticles(req, res, next),
);
router.get('/admin/queue', (req, res, next) =>
  knowledgeController.getAdminQueue(req, res, next),
);
router.patch('/:id', (req, res, next) =>
  knowledgeController.update(req, res, next),
);
router.post('/:id/submit', (req, res, next) =>
  knowledgeController.submitForReview(req, res, next),
);
router.post('/:id/review', (req, res, next) =>
  knowledgeController.review(req, res, next),
);

// Publishing Requires CONTENT_PUBLISH Permission
router.post(
  '/:id/publish',
  requirePermissions(PermissionKey.CONTENT_PUBLISH),
  (req, res, next) => knowledgeController.publish(req, res, next),
);

export const knowledgeRouter = router;
