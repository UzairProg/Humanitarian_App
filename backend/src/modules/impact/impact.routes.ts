import { Router } from 'express';
import { impactController } from './impact.controller';

const router = Router();

router.get('/summary', (req, res, next) => impactController.getSummary(req, res, next));
router.get('/organization/:orgId', (req, res, next) =>
  impactController.getOrganizationImpact(req, res, next),
);

export const impactRouter = router;
