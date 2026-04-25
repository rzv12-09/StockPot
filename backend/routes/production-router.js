import express from 'express';
import { getCookedStock, createProductionBatch } from '../controllers/production-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';
const router = express.Router();

router.get('/stock', getCookedStock);
router.post('/', authorizeRoles('MANAGER'), createProductionBatch);

export default router;
