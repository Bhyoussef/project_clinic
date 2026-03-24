import doctorModel from '../models/doctorModel.js';
import notificationModel from '../models/notificationModel.js';
import { createAppError } from '../utils/appError.js';

class NotificationService {
  async listNotificationsByDoctor(doctorId) {
    const doctor = await doctorModel.findById(Number(doctorId));

    if (!doctor) {
      throw createAppError('Doctor not found.', 404);
    }

    const notifications = await notificationModel.listByDoctorId(Number(doctorId));

    return {
      doctor,
      notifications,
    };
  }
}

export default new NotificationService();
