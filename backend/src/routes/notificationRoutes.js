import { Router } from 'express';
import { getNotificationsByDoctor } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/doctor/:doctorId', authenticate, getNotificationsByDoctor);

export default router;
