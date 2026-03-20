import express from 'express';
import ingredientRouter from './ingredient-router.js';

const router = express.Router();
router.use('/ingredients',ingredientRouter);

export default router;