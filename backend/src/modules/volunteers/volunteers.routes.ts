import { Router } from 'express';
import { volunteersController } from './volunteers.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';

const router = Router();

// Public opportunity listing & details
router.get('/opportunities', (req, res, next) =>
  volunteersController.listOpportunities(req, res, next),
);
router.get('/opportunities/:id', (req, res, next) =>
  volunteersController.getOpportunityById(req, res, next),
);

// Protected routes
router.use(authenticateJwt);

// Volunteer Profile
router.get('/profile/me', (req, res, next) =>
  volunteersController.getMyProfile(req, res, next),
);
router.post('/profile', (req, res, next) =>
  volunteersController.upsertProfile(req, res, next),
);

// Opportunities Management
router.post('/opportunities', (req, res, next) =>
  volunteersController.createOpportunity(req, res, next),
);
router.patch('/opportunities/:id', (req, res, next) =>
  volunteersController.updateOpportunity(req, res, next),
);

// Applications
router.post('/opportunities/:id/apply', (req, res, next) =>
  volunteersController.apply(req, res, next),
);
router.get('/opportunities/:id/applications', (req, res, next) =>
  volunteersController.listApplicationsForOpportunity(req, res, next),
);
router.get('/my-applications', (req, res, next) =>
  volunteersController.getMyApplications(req, res, next),
);
router.patch('/applications/:id/status', (req, res, next) =>
  volunteersController.updateApplicationStatus(req, res, next),
);

export const volunteersRouter = router;
