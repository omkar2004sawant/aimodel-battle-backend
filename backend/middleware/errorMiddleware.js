export function notFound(req, res, _next) {
  res.status(404).json({ message: `Not found — ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  let message = err.message || 'Server error';
  let status = err.statusCode || 500;
  if (err.name === 'ValidationError') status = 400;
  if (err.code === 11000) {
    status = 409;
    message = 'A record with that value already exists';
  }
  console.error(err.stack || err);
  res.status(status).json({ message });
}
