import { Router } from 'express';
import { searchController } from './search.controller';

const router = Router();

// Public platform-wide discovery search
router.get('/', (req, res, next) => searchController.search(req, res, next));

export const searchRouter = router;
