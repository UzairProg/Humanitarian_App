import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', (req, res, next) => notificationsController.list(req, res, next));
router.get('/unread-count', (req, res, next) =>
  notificationsController.getUnreadCount(req, res, next),
);
router.patch('/read-all', (req, res, next) => notificationsController.markAllRead(req, res, next));
router.patch('/:id/read', (req, res, next) => notificationsController.markRead(req, res, next));

export const notificationsRouter = router;
