export function getHealthStatus(_req, res) {
  res.status(200).json({
    message: 'Clinic Appointment Booking API is running.',
  });
}
