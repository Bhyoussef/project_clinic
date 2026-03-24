import doctorService from '../services/doctorService.js';

export async function getDoctors(_req, res, next) {
  try {
    const doctors = await doctorService.listDoctors();
    res.status(200).json({ doctors });
  } catch (error) {
    next(error);
  }
}

export async function getDoctor(req, res, next) {
  try {
    const doctor = await doctorService.getDoctor(req.params.id);
    res.status(200).json({ doctor });
  } catch (error) {
    next(error);
  }
}

export async function createDoctor(req, res, next) {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    res.status(201).json({ doctor });
  } catch (error) {
    next(error);
  }
}

export async function updateDoctor(req, res, next) {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    res.status(200).json({ doctor });
  } catch (error) {
    next(error);
  }
}

export async function deleteDoctor(req, res, next) {
  try {
    const result = await doctorService.deleteDoctor(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
