import express from 'express';
import { emptySlot, executeTransfer, getServingSlots, createSlot, updateSlot, deleteSlot } from '../controllers/service-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';

const router = express.Router();
router.get('/slots', getServingSlots);
router.post('/transfer', authorizeRoles('MANAGER'), executeTransfer);
router.post('/empty', authorizeRoles('MANAGER'), emptySlot);

// CRUD supiere (doar MANAGER)
router.post('/slots', authorizeRoles('MANAGER'), createSlot);
router.put('/slots/:id', authorizeRoles('MANAGER'), updateSlot);
router.delete('/slots/:id', authorizeRoles('MANAGER'), deleteSlot);

export default router;
