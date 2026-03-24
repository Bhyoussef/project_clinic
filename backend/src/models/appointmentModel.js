import { executeQuery } from '../config/db.js';

function mapAppointment(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    doctorId: row.doctor_id,
    timeSlotId: row.time_slot_id,
    appointmentDate: row.appointment_date,
    status: row.status,
    reason: row.reason,
    notes: row.notes,
    patientName: row.patient_name || null,
    patientPhone: row.patient_phone || null,
    doctorName: row.doctor_name || null,
    slotStartTime: row.slot_start_time || null,
    slotEndTime: row.slot_end_time || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const appointmentSelect = `
  SELECT
    a.*,
    u.name AS patient_name,
    u.phone AS patient_phone,
    d.name AS doctor_name,
    ts.start_time AS slot_start_time,
    ts.end_time AS slot_end_time
  FROM appointments a
  INNER JOIN users u ON u.id = a.user_id
  INNER JOIN doctors d ON d.id = a.doctor_id
  INNER JOIN time_slots ts ON ts.id = a.time_slot_id
`;

class AppointmentModel {
  async create(appointment) {
    const {
      userId,
      doctorId,
      timeSlotId,
      appointmentDate,
      status = 'scheduled',
      reason = null,
      notes = null,
    } = appointment;
    const result = await executeQuery(
      `
        INSERT INTO appointments (
          user_id,
          doctor_id,
          time_slot_id,
          appointment_date,
          status,
          reason,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [userId, doctorId, timeSlotId, appointmentDate, status, reason, notes],
      'creating appointment'
    );

    return this.findById(result.insertId);
  }

  async findById(id) {
    const rows = await executeQuery(
      `${appointmentSelect}
       WHERE a.id = ?
       LIMIT 1`,
      [id],
      'finding appointment by id'
    );

    return mapAppointment(rows[0]);
  }

  async listAll() {
    const rows = await executeQuery(
      `${appointmentSelect}
       ORDER BY a.appointment_date DESC`,
      [],
      'listing all appointments'
    );

    return rows.map(mapAppointment);
  }

  async listByUserId(userId) {
    const rows = await executeQuery(
      `${appointmentSelect}
       WHERE a.user_id = ?
       ORDER BY a.appointment_date DESC`,
      [userId],
      'listing appointments by user'
    );

    return rows.map(mapAppointment);
  }

  async listByDoctorId(doctorId) {
    const rows = await executeQuery(
      `${appointmentSelect}
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date DESC`,
      [doctorId],
      'listing appointments by doctor'
    );

    return rows.map(mapAppointment);
  }

  async updateStatus(id, status) {
    await executeQuery(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id],
      'updating appointment status'
    );

    return this.findById(id);
  }
}

export default new AppointmentModel();
