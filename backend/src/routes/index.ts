import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { usersRouter } from '../modules/users/users.routes';
import { organizationsRouter } from '../modules/organizations/organizations.routes';
import { requestsRouter } from '../modules/humanitarian-requests/requests.routes';
import { foodProgramsRouter } from '../modules/food-programs/food-programs.routes';
import { eventsRouter } from '../modules/events/events.routes';
import { volunteersRouter } from '../modules/volunteers/volunteers.routes';
import { businessesRouter } from '../modules/businesses/businesses.routes';
import { knowledgeRouter } from '../modules/knowledge/knowledge.routes';
import { contributorsRouter } from '../modules/contributors/contributors.routes';
import { notificationsRouter } from '../modules/notifications/notifications.routes';
import { impactRouter } from '../modules/impact/impact.routes';
import { reportsRouter } from '../modules/reports/reports.routes';
import { auditRouter } from '../modules/audit/audit.routes';
import { searchRouter } from '../modules/search/search.routes';
import { healthRouter } from '../modules/health/health.routes';

const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/users', usersRouter);
apiV1Router.use('/organizations', organizationsRouter);
apiV1Router.use('/requests', requestsRouter);
apiV1Router.use('/food-programs', foodProgramsRouter);
apiV1Router.use('/events', eventsRouter);
apiV1Router.use('/volunteers', volunteersRouter);
apiV1Router.use('/businesses', businessesRouter);
apiV1Router.use('/knowledge', knowledgeRouter);
apiV1Router.use('/contributors', contributorsRouter);
apiV1Router.use('/notifications', notificationsRouter);
apiV1Router.use('/impact', impactRouter);
apiV1Router.use('/reports', reportsRouter);
apiV1Router.use('/audit', auditRouter);
apiV1Router.use('/search', searchRouter);
apiV1Router.use('/health', healthRouter);

export { apiV1Router };
