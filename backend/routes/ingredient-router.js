import express from 'express';
import { getIngredients, addIngredient } from '../controllers/ingredient-controller.js';

const router = express.Router();

router.get('/', getIngredients);
router.post('/', addIngredient);
export default router;
