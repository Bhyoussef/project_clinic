import { Router } from 'express';
import {
  createDoctor,
  deleteDoctor,
  getDoctor,
  getDoctors,
  updateDoctor,
} from '../controllers/doctorController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.post('/', authenticate, createDoctor);
router.put('/:id', authenticate, updateDoctor);
router.delete('/:id', authenticate, deleteDoctor);

export default router;
