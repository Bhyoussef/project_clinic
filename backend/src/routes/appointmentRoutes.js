import { Router } from 'express';
import {
  createAppointment,
  getAllAppointments,
  getAppointmentsByDoctor,
  getAvailableDoctorSlots,
  getMyAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getAllAppointments);
router.get('/me', authenticate, getMyAppointments);
router.get('/doctor/:doctorId', authenticate, getAppointmentsByDoctor);
router.get('/doctor/:doctorId/availability', authenticate, getAvailableDoctorSlots);
router.post('/', authenticate, createAppointment);
router.put('/:id', authenticate, updateAppointmentStatus);

export default router;
