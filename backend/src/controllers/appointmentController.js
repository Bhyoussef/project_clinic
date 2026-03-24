import appointmentService from '../services/appointmentService.js';

export async function getAllAppointments(_req, res, next) {
  try {
    const result = await appointmentService.listAllAppointments();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAppointmentsByDoctor(req, res, next) {
  try {
    const result = await appointmentService.listAppointmentsByDoctor(req.params.doctorId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAvailableDoctorSlots(req, res, next) {
  try {
    const result = await appointmentService.listAvailableSlots(req.params.doctorId, req.query.date);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMyAppointments(req, res, next) {
  try {
    const result = await appointmentService.listAppointmentsByUser(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function createAppointment(req, res, next) {
  try {
    const result = await appointmentService.createAppointment(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateAppointmentStatus(req, res, next) {
  try {
    const result = await appointmentService.updateAppointmentStatus(req.params.id, req.body.status);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
