import { Router } from 'express';
import { eventsController } from './events.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';

const router = Router();

// Public event discovery
router.get('/', (req, res, next) => eventsController.list(req, res, next));
router.get('/:id', (req, res, next) => eventsController.getById(req, res, next));

// Protected operations
router.use(authenticateJwt);

router.post('/', (req, res, next) => eventsController.create(req, res, next));
router.patch('/:id', (req, res, next) => eventsController.update(req, res, next));
router.patch('/:id/status', (req, res, next) =>
  eventsController.updateStatus(req, res, next),
);

// Registration flow
router.get('/my/registrations', (req, res, next) =>
  eventsController.getMyRegistrations(req, res, next),
);
router.post('/:id/register', (req, res, next) =>
  eventsController.register(req, res, next),
);
router.delete('/:id/register', (req, res, next) =>
  eventsController.cancelRegistration(req, res, next),
);
router.get('/:id/registrations', (req, res, next) =>
  eventsController.listRegistrations(req, res, next),
);

export const eventsRouter = router;
