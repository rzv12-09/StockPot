import express from 'express';
import { addRecipe, getRecipes, deleteRecipe } from '../controllers/recipe-controller.js';

const router = express.Router();

router.post('/', addRecipe);
router.get('/', getRecipes);
router.delete('/:id', deleteRecipe);

export default router;
