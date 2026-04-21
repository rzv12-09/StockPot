import express from 'express';
import {
  getIngredients,
  addIngredient,
  deleteIngredient,
  updateIngredient,
} from '../controllers/ingredient-controller.js';

const router = express.Router();

router.get('/', getIngredients);
router.post('/', addIngredient);
router.delete('/:id', deleteIngredient);
router.put('/:id', updateIngredient);

export default router;
