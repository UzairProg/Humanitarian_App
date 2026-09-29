import { Router } from 'express';
import { foodProgramsController } from './food-programs.controller';
import { authenticateJwt, optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

// Public discovery
router.get('/', optionalAuth, (req, res, next) => foodProgramsController.list(req, res, next));
router.get('/:id', (req, res, next) => foodProgramsController.getById(req, res, next));

// Protected operations
router.post('/', authenticateJwt, (req, res, next) =>
  foodProgramsController.create(req, res, next),
);
router.patch('/:id', authenticateJwt, (req, res, next) =>
  foodProgramsController.update(req, res, next),
);
router.post('/:id/reserve', authenticateJwt, (req, res, next) =>
  foodProgramsController.reserve(req, res, next),
);

export const foodProgramsRouter = router;
