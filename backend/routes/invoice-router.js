import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  deleteInvoice,
} from '../controllers/invoice-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', authorizeRoles('MANAGER'), createInvoice);
router.delete('/:id', authorizeRoles('MANAGER'), deleteInvoice);

export default router;
