import express from 'express';
import { addRecipe } from '../controllers/recipe-controller.js';

const router = express.Router();

router.post('/', addRecipe);

export default router;
