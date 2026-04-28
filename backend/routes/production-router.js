import express from 'express';
import {
  getCookedStock,
  createProductionBatch,
  getProductionPreview,
} from '../controllers/production-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';
const router = express.Router();

router.get('/stock', getCookedStock);
router.post('/preview', authorizeRoles('MANAGER'), getProductionPreview);
router.post('/', authorizeRoles('MANAGER'), createProductionBatch);

export default router;
