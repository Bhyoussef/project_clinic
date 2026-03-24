import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js';
import notificationModel from '../models/notificationModel.js';
import timeSlotModel from '../models/timeSlotModel.js';
import userModel from '../models/userModel.js';
import { runInTransaction } from '../config/db.js';
import { createAppError } from '../utils/appError.js';
import {
  validateAppointmentRequest,
  validateAvailabilityDate,
} from '../utils/appointmentValidation.js';

const allowedStatuses = ['confirmed', 'rejected'];

class AppointmentService {
  async listAllAppointments() {
    const appointments = await appointmentModel.listAll();
    return { appointments };
  }

  async listAppointmentsByUser(userId) {
    const appointments = await appointmentModel.listByUserId(Number(userId));
    return { appointments };
  }

  async listAppointmentsByDoctor(doctorId) {
    const doctor = await doctorModel.findById(Number(doctorId));

    if (!doctor) {
      throw createAppError('Doctor not found.', 404);
    }

    const appointments = await appointmentModel.listByDoctorId(Number(doctorId));

    return {
      doctor,
      appointments,
    };
  }

  async listAvailableSlots(doctorId, slotDate) {
    const normalizedDoctorId = Number(doctorId);
    const normalizedDate = validateAvailabilityDate(slotDate);
    const doctor = await doctorModel.findById(normalizedDoctorId);

    if (!doctor) {
      throw createAppError('Doctor not found.', 404);
    }

    const slots = await timeSlotModel.listAvailableByDoctor(normalizedDoctorId, normalizedDate);

    return {
      doctor,
      slotDate: normalizedDate,
      slots,
    };
  }

  async createAppointment(payload, authenticatedUser) {
    if (!authenticatedUser?.id) {
      throw createAppError('Authentication is required to book an appointment.', 401);
    }

    const { doctorId, appointmentDate, slotTime } = validateAppointmentRequest(payload);
    const reason = payload.reason?.trim() || 'Clinic booking from patient portal';
    const notes = payload.notes?.trim() || null;

    const [doctor, user] = await Promise.all([
      doctorModel.findById(doctorId),
      userModel.findById(Number(authenticatedUser.id)),
    ]);

    if (!doctor) {
      throw createAppError('Selected doctor was not found.', 404);
    }

    if (!user) {
      throw createAppError('Authenticated user could not be found.', 404);
    }

    if (!user.isProfileCompleted || !user.name) {
      throw createAppError('Please complete your profile before booking an appointment.', 400);
    }

    const appointmentId = await runInTransaction(async (execute) => {
      const rows = await execute(
        `
          SELECT *
          FROM time_slots
          WHERE doctor_id = ?
            AND slot_date = ?
            AND start_time = ?
          LIMIT 1
          FOR UPDATE
        `,
        [doctorId, appointmentDate, slotTime],
        'locking appointment time slot'
      );

      const timeSlot = rows[0];

      if (!timeSlot || !Number(timeSlot.is_available)) {
        throw createAppError('Selected slot is no longer available.', 409);
      }

      const appointmentResult = await execute(
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
        [
          user.id,
          doctor.id,
          timeSlot.id,
          `${appointmentDate} ${slotTime}`,
          'scheduled',
          reason,
          notes,
        ],
        'creating appointment in transaction'
      );

      await execute(
        'UPDATE time_slots SET is_available = 0 WHERE id = ? AND is_available = 1',
        [timeSlot.id],
        'marking time slot as booked in transaction'
      );

      await execute(
        `
          INSERT INTO notifications (user_id, appointment_id, type, title, message)
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          user.id,
          appointmentResult.insertId,
          'appointment_confirmation',
          'Appointment booked',
          `Your appointment with ${doctor.name} is scheduled for ${appointmentDate} at ${slotTime.slice(0, 5)}.`,
        ],
        'creating booking notification in transaction'
      );

      return appointmentResult.insertId;
    }, 'creating appointment transaction');

    const appointment = await appointmentModel.findById(appointmentId);

    return {
      message: 'Appointment booked successfully.',
      appointment,
      doctor,
      patient: user,
    };
  }

  async updateAppointmentStatus(appointmentId, status) {
    if (!allowedStatuses.includes(status)) {
      throw createAppError('Status must be either confirmed or rejected.', 400);
    }

    const existingAppointment = await appointmentModel.findById(Number(appointmentId));

    if (!existingAppointment) {
      throw createAppError('Appointment not found.', 404);
    }

    if (existingAppointment.status === status) {
      return {
        message: `Appointment is already ${status}.`,
        appointment: existingAppointment,
      };
    }

    const updatedAppointment = await appointmentModel.updateStatus(Number(appointmentId), status);

    if (status === 'rejected') {
      await timeSlotModel.updateAvailability(updatedAppointment.timeSlotId, true);
    }

    if (status === 'confirmed') {
      await timeSlotModel.updateAvailability(updatedAppointment.timeSlotId, false);
    }

    await notificationModel.create({
      userId: updatedAppointment.userId,
      appointmentId: updatedAppointment.id,
      type: 'appointment_status',
      title: `Appointment ${status}`,
      message: `Your appointment with ${updatedAppointment.doctorName} has been ${status}.`,
    });

    return {
      message: `Appointment ${status} successfully.`,
      appointment: updatedAppointment,
    };
  }
}

export default new AppointmentService();
