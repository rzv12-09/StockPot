import express from 'express';
import {
  getIngredients,
  addIngredient,
  deleteIngredient,
} from '../controllers/ingredient-controller.js';

const router = express.Router();

router.get('/', getIngredients);
router.post('/', addIngredient);
router.delete('/:id', deleteIngredient);
export default router;
