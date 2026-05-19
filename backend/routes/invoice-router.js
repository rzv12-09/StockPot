import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  deleteInvoice,
} from '../controllers/invoice-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';

import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', authorizeRoles('MANAGER'), upload.single('image'), createInvoice);
router.delete('/:id', authorizeRoles('MANAGER'), deleteInvoice);

export default router;
