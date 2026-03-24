export function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error('Unhandled application error:', err);
  }

  res.status(statusCode).json({
    message: err.message || 'Internal server error.',
    details: err.details || undefined,
  });
}
