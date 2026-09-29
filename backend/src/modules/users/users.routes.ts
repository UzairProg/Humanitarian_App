import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { RoleType } from '@al-husseiniya/types';

const router = Router();

router.use(authenticateJwt);

router.get('/', requireRoles(RoleType.ADMIN, RoleType.SUPER_ADMIN), (req, res, next) =>
  usersController.list(req, res, next),
);
router.get('/:id', (req, res, next) => usersController.getById(req, res, next));
router.patch('/:id/profile', (req, res, next) => usersController.updateProfile(req, res, next));
router.post('/:id/roles', requireRoles(RoleType.ADMIN, RoleType.SUPER_ADMIN), (req, res, next) =>
  usersController.assignRole(req, res, next),
);

export const usersRouter = router;
