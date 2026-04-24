import express from 'express';
import ingredientRouter from './ingredient-router.js';
import recipeRouter from './recipe-router.js';
import authRouter from './auth-router.js';
import { authenticateToken } from '../middlewares/auth-middleware.js';

const router = express.Router();
router.use('/auth', authRouter);

router.use(authenticateToken);

router.use('/ingredients', ingredientRouter);
router.use('/recipes', recipeRouter);

export default router;
