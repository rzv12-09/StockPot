import express from 'express';
import { getIngredients } from "../controllers/ingredient-controller.js";

const router = express.Router();

router.get('/',getIngredients);

export default router;