import { executeQuery } from '../config/db.js';

function mapTimeSlot(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    doctorId: row.doctor_id,
    slotDate: row.slot_date,
    startTime: row.start_time,
    endTime: row.end_time,
    isAvailable: Boolean(row.is_available),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class TimeSlotModel {
  async create(timeSlot) {
    const { doctorId, slotDate, startTime, endTime, isAvailable = true } = timeSlot;
    const result = await executeQuery(
      `
        INSERT INTO time_slots (doctor_id, slot_date, start_time, end_time, is_available)
        VALUES (?, ?, ?, ?, ?)
      `,
      [doctorId, slotDate, startTime, endTime, Number(isAvailable)],
      'creating time slot'
    );

    return this.findById(result.insertId);
  }

  async findById(id) {
    const rows = await executeQuery(
      'SELECT * FROM time_slots WHERE id = ? LIMIT 1',
      [id],
      'finding time slot by id'
    );

    return mapTimeSlot(rows[0]);
  }

  async findAvailableSlot(doctorId, slotDate, startTime) {
    const rows = await executeQuery(
      `
        SELECT *
        FROM time_slots
        WHERE doctor_id = ?
          AND slot_date = ?
          AND start_time = ?
          AND is_available = 1
        LIMIT 1
      `,
      [doctorId, slotDate, startTime],
      'finding available time slot'
    );

    return mapTimeSlot(rows[0]);
  }

  async listByDoctor(doctorId) {
    const rows = await executeQuery(
      'SELECT * FROM time_slots WHERE doctor_id = ? ORDER BY slot_date ASC, start_time ASC',
      [doctorId],
      'listing time slots by doctor'
    );

    return rows.map(mapTimeSlot);
  }

  async listAvailableByDoctor(doctorId, slotDate = null) {
    const query = slotDate
      ? `
          SELECT *
          FROM time_slots
          WHERE doctor_id = ? AND slot_date = ? AND is_available = 1
          ORDER BY start_time ASC
        `
      : `
          SELECT *
          FROM time_slots
          WHERE doctor_id = ? AND is_available = 1
          ORDER BY slot_date ASC, start_time ASC
        `;
    const params = slotDate ? [doctorId, slotDate] : [doctorId];
    const rows = await executeQuery(query, params, 'listing available time slots');

    return rows.map(mapTimeSlot);
  }

  async markBooked(id) {
    await executeQuery(
      'UPDATE time_slots SET is_available = 0 WHERE id = ? AND is_available = 1',
      [id],
      'marking time slot as booked'
    );

    return this.findById(id);
  }

  async updateAvailability(id, isAvailable) {
    await executeQuery(
      'UPDATE time_slots SET is_available = ? WHERE id = ?',
      [Number(isAvailable), id],
      'updating time slot availability'
    );

    return this.findById(id);
  }
}

export default new TimeSlotModel();
