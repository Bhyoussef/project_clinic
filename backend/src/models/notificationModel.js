import { executeQuery } from '../config/db.js';

function mapNotification(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    appointmentId: row.appointment_id,
    type: row.type,
    title: row.title,
    message: row.message,
    isRead: Boolean(row.is_read),
    sentAt: row.sent_at,
    createdAt: row.created_at,
    doctorId: row.doctor_id || null,
    doctorName: row.doctor_name || null,
    patientName: row.patient_name || null,
  };
}

class NotificationModel {
  async create(notification) {
    const { userId, appointmentId = null, type, title, message } = notification;
    const result = await executeQuery(
      `
        INSERT INTO notifications (user_id, appointment_id, type, title, message)
        VALUES (?, ?, ?, ?, ?)
      `,
      [userId, appointmentId, type, title, message],
      'creating notification'
    );

    return this.findById(result.insertId);
  }

  async findById(id) {
    const rows = await executeQuery(
      `
        SELECT
          n.*,
          a.doctor_id,
          d.name AS doctor_name,
          u.name AS patient_name
        FROM notifications n
        LEFT JOIN appointments a ON a.id = n.appointment_id
        LEFT JOIN doctors d ON d.id = a.doctor_id
        LEFT JOIN users u ON u.id = n.user_id
        WHERE n.id = ?
        LIMIT 1
      `,
      [id],
      'finding notification by id'
    );

    return mapNotification(rows[0]);
  }

  async listByUserId(userId) {
    const rows = await executeQuery(
      `
        SELECT
          n.*,
          a.doctor_id,
          d.name AS doctor_name,
          u.name AS patient_name
        FROM notifications n
        LEFT JOIN appointments a ON a.id = n.appointment_id
        LEFT JOIN doctors d ON d.id = a.doctor_id
        LEFT JOIN users u ON u.id = n.user_id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
      `,
      [userId],
      'listing notifications by user'
    );

    return rows.map(mapNotification);
  }

  async listByDoctorId(doctorId) {
    const rows = await executeQuery(
      `
        SELECT
          n.*,
          a.doctor_id,
          d.name AS doctor_name,
          u.name AS patient_name
        FROM notifications n
        INNER JOIN appointments a ON a.id = n.appointment_id
        LEFT JOIN doctors d ON d.id = a.doctor_id
        LEFT JOIN users u ON u.id = n.user_id
        WHERE a.doctor_id = ?
        ORDER BY n.created_at DESC
      `,
      [doctorId],
      'listing notifications by doctor'
    );

    return rows.map(mapNotification);
  }

  async markAsRead(id) {
    await executeQuery(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [id],
      'marking notification as read'
    );

    return this.findById(id);
  }
}

export default new NotificationModel();
