import { executeQuery } from '../config/db.js';

class OtpModel {
  async invalidateActiveOtps(phone) {
    await executeQuery(
      'UPDATE otp_codes SET is_verified = 1 WHERE phone = ? AND is_verified = 0',
      [phone],
      'invalidating active OTPs'
    );
  }

  async createOtp(phone, otpCode, expiresAt) {
    await executeQuery(
      'INSERT INTO otp_codes (phone, otp_code, expires_at) VALUES (?, ?, ?)',
      [phone, otpCode, expiresAt],
      'creating OTP'
    );
  }

  async findValidOtp(phone, otpCode) {
    const rows = await executeQuery(
      `
        SELECT *
        FROM otp_codes
        WHERE phone = ?
          AND otp_code = ?
          AND is_verified = 0
          AND expires_at > NOW()
        ORDER BY id DESC
        LIMIT 1
      `,
      [phone, otpCode],
      'finding valid OTP'
    );

    return rows[0] || null;
  }

  async markVerified(id) {
    await executeQuery(
      'UPDATE otp_codes SET is_verified = 1 WHERE id = ?',
      [id],
      'marking OTP as verified'
    );
  }
}

export default new OtpModel();
