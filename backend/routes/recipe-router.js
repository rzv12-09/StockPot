import express from 'express';
import { addRecipe, getRecipes, deleteRecipe } from '../controllers/recipe-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';
const router = express.Router();

router.get('/', getRecipes);

router.post('/', authorizeRoles('MANAGER'), addRecipe);
router.delete('/:id', authorizeRoles('MANAGER'), deleteRecipe);

export default router;
