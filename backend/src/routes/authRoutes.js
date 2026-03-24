import { Router } from 'express';
import {
  completeProfile,
  getCurrentUser,
  sendOtp,
  verifyOtp,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', authenticate, getCurrentUser);
router.post('/profile', authenticate, completeProfile);

export default router;
