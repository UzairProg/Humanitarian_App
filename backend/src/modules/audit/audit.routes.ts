import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { RoleType } from '@al-husseiniya/types';

const router = Router();

router.use(authenticateJwt);
router.use(requireRoles(RoleType.ADMIN, RoleType.SUPER_ADMIN));

router.get('/', (req, res, next) => auditController.list(req, res, next));

export const auditRouter = router;
