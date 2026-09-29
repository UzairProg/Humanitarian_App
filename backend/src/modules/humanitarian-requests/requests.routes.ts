import { Router } from 'express';
import { requestsController } from './requests.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';

const router = Router();

// Publicly readable categories
router.get('/categories', (req, res, next) => requestsController.listCategories(req, res, next));

// Protected operations
router.use(authenticateJwt);

router.post('/', (req, res, next) => requestsController.create(req, res, next));
router.get('/', (req, res, next) => requestsController.list(req, res, next));
router.get('/:id', (req, res, next) => requestsController.getById(req, res, next));
router.patch('/:id/status', (req, res, next) => requestsController.updateStatus(req, res, next));

export const requestsRouter = router;
