import { Router } from 'express';
import { eventsController } from './events.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';

const router = Router();

// Public event discovery
router.get('/', (req, res, next) => eventsController.list(req, res, next));
router.get('/:id', (req, res, next) => eventsController.getById(req, res, next));

// Protected creation
router.post('/', authenticateJwt, (req, res, next) => eventsController.create(req, res, next));

export const eventsRouter = router;
