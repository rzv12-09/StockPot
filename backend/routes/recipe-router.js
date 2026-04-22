import express from 'express';
import { addRecipe, getRecipes } from '../controllers/recipe-controller.js';

const router = express.Router();

router.post('/', addRecipe);
router.get('/', getRecipes);

export default router;
