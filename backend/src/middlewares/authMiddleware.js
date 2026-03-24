import jwt from 'jsonwebtoken';
import { createAppError } from '../utils/appError.js';

export function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw createAppError('Authentication token is required.', 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key');
    req.user = { id: payload.sub, phone: payload.phone };
    next();
  } catch (error) {
    if (error.statusCode) {
      next(error);
      return;
    }

    next(createAppError('Invalid or expired authentication token.', 401));
  }
}
