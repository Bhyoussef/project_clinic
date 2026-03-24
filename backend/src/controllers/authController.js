import authService from '../services/authService.js';

export async function sendOtp(req, res, next) {
  try {
    const result = await authService.sendOtp(req.body.phone);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const result = await authService.verifyOtp(req.body.phone, req.body.otp);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function completeProfile(req, res, next) {
  try {
    const result = await authService.completeProfile(req.user.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const result = await authService.getAuthenticatedUser(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
