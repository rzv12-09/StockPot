import express from 'express';
import { executeTransfer, getServingSlots } from '../controllers/service-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';

const router = express.Router();
router.get('/slots', getServingSlots);
router.post('/transfer', authorizeRoles('MANAGER'), executeTransfer);

export default router;
