import express from 'express';
import {
  getCookedStock,
  createProductionBatch,
  getProductionPreview,
  updateSoupStock,
  getBatchesByRecipe,
} from '../controllers/production-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';
const router = express.Router();

router.get('/stock', getCookedStock);
router.get('/stock/batches/:recipeId', getBatchesByRecipe);
router.post('/preview', authorizeRoles('MANAGER', 'PRODUCTION'), getProductionPreview);
router.post('/', authorizeRoles('MANAGER', 'PRODUCTION'), createProductionBatch);
router.put('/stock/:id', authorizeRoles('MANAGER', 'PRODUCTION'), updateSoupStock);

export default router;
