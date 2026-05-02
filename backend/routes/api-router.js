import express from 'express';
import ingredientRouter from './ingredient-router.js';
import recipeRouter from './recipe-router.js';
import authRouter from './auth-router.js';
import productionRouter from './production-router.js';
import serviceRouter from './service-router.js';
import userRouter from './user-router.js';
import { authenticateToken } from '../middlewares/auth-middleware.js';

const router = express.Router();
router.use('/auth', authRouter);

router.use(authenticateToken);

router.use('/ingredients', ingredientRouter);
router.use('/recipes', recipeRouter);
router.use('/production', productionRouter);
router.use('/service', serviceRouter);
router.use('/users', userRouter);

export default router;
