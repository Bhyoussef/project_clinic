import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController.js';
import appointmentRoutes from './appointmentRoutes.js';
import authRoutes from './authRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

router.get('/health', getHealthStatus);
router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/notifications', notificationRoutes);

export default router;
