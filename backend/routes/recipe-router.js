import express from 'express';
import {
  addRecipe,
  getRecipes,
  deleteRecipe,
  updateRecipe,
} from '../controllers/recipe-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';
const router = express.Router();

router.get('/', getRecipes);

router.post('/', authorizeRoles('MANAGER'), addRecipe);
router.delete('/:id', authorizeRoles('MANAGER'), deleteRecipe);
router.put('/:id', authorizeRoles('MANAGER'), updateRecipe);

export default router;
