import express from 'express';
import { getSuppliers, createSupplier } from '../controllers/supplier-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/', getSuppliers);
router.post('/', authorizeRoles('MANAGER'), createSupplier);

export default router;
