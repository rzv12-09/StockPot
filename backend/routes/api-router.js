import express from 'express';
import ingredientRouter from './ingredient-router.js';
import recipeRouter from './recipe-router.js';

const router = express.Router();
router.use('/ingredients', ingredientRouter);
router.use('/recipes', recipeRouter);

export default router;
