import notificationService from '../services/notificationService.js';

export async function getNotificationsByDoctor(req, res, next) {
  try {
    const result = await notificationService.listNotificationsByDoctor(req.params.doctorId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
