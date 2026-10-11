import { Router } from 'express';
import { getAnalytics } from '../controllers/AnalyticsController';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/', getAnalytics);

export default router;
