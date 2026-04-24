import express from 'express';
import {
  getIngredients,
  addIngredient,
  deleteIngredient,
  updateIngredient,
} from '../controllers/ingredient-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/', getIngredients);
router.post('/', authorizeRoles('MANAGER'), addIngredient);
router.delete('/:id', authorizeRoles('MANAGER'), deleteIngredient);
router.put('/:id', authorizeRoles('MANAGER'), updateIngredient);

export default router;
