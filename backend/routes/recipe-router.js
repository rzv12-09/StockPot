import express from 'express';
import {
  addRecipe,
  getRecipes,
  deleteRecipe,
  updateRecipe,
  restoreRecipe,
  getArchivedRecipes,
} from '../controllers/recipe-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';
const router = express.Router();

router.get('/', getRecipes);
router.get('/archived', authorizeRoles('MANAGER'), getArchivedRecipes);

router.post('/', authorizeRoles('MANAGER'), addRecipe);
router.delete('/:id', authorizeRoles('MANAGER'), deleteRecipe);
router.put('/:id', authorizeRoles('MANAGER'), updateRecipe);
router.put('/:id/restore', authorizeRoles('MANAGER'), restoreRecipe);

export default router;
