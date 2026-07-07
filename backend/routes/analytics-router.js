import express from 'express';
import { getDashboardStats, getComparisonData } from '../controllers/analytics-controller.js';
import { authenticateToken } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, getDashboardStats);
router.get('/comparison', authenticateToken, getComparisonData);

export default router;
