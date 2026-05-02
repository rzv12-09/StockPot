import express from 'express';
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getActiveUsers,
} from '../controllers/user-controller.js';
import { authorizeRoles } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.use(authorizeRoles('MANAGER'));

router.get('/pending', getPendingUsers);
router.get('/active', getActiveUsers);
router.put('/:id/approve', approveUser);
router.delete('/:id/reject', rejectUser);

export default router;
