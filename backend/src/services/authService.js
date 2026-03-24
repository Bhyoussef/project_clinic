import jwt from 'jsonwebtoken';
import otpModel from '../models/otpModel.js';
import userModel from '../models/userModel.js';
import { createAppError } from '../utils/appError.js';
import { generateOtp } from '../utils/generateOtp.js';
import { normalizePhone } from '../utils/normalizePhone.js';

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      phone: user.phone,
    },
    process.env.JWT_SECRET || 'super-secret-jwt-key',
    { expiresIn: '7d' }
  );
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

class AuthService {
  async sendOtp(phoneInput) {
    const phone = normalizePhone(phoneInput);

    if (!phone || phone.length < 10) {
      throw createAppError('A valid phone number is required.', 400);
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await otpModel.invalidateActiveOtps(phone);
    await otpModel.createOtp(phone, otpCode, expiresAt);

    console.log(`[OTP] Phone: ${phone}, Code: ${otpCode}`);

    return {
      phone,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
      message: 'OTP generated successfully.',
    };
  }

  async verifyOtp(phoneInput, otpCode) {
    const phone = normalizePhone(phoneInput);

    if (!phone || !otpCode) {
      throw createAppError('Phone number and OTP are required.', 400);
    }

    const otpRecord = await otpModel.findValidOtp(phone, otpCode);

    if (!otpRecord) {
      throw createAppError('Invalid or expired OTP.', 401);
    }

    await otpModel.markVerified(otpRecord.id);

    const user = await userModel.createIfNotExists(phone);
    const token = signToken(user);

    return {
      token,
      user,
      isNewUser: !user.isProfileCompleted,
    };
  }

  async completeProfile(userId, profile) {
    const name = profile.name?.trim();
    const email = profile.email?.trim();
    const dob = profile.dob;

    if (!name || !email || !dob) {
      throw createAppError('Name, email, and date of birth are required.', 400);
    }

    if (!isValidEmail(email)) {
      throw createAppError('A valid email address is required.', 400);
    }

    if (Number.isNaN(new Date(dob).getTime())) {
      throw createAppError('A valid date of birth is required.', 400);
    }

    const updatedUser = await userModel.updateProfile(userId, { name, email, dob });

    return {
      user: updatedUser,
    };
  }

  async getAuthenticatedUser(userId) {
    const user = await userModel.findById(userId);

    if (!user) {
      throw createAppError('User not found.', 404);
    }

    return { user };
  }
}

export default new AuthService();
