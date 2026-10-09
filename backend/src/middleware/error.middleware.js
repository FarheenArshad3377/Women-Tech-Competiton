export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  console.error(err);
  if (err.code === "23505") {
    return res.status(409).json({ error: "An account with these details already exists." });
  }
  const status = Number.isInteger(err.status) ? err.status : 500;
  res.status(status).json({
    error: status >= 500 && process.env.NODE_ENV === "production"
      ? "Internal server error."
      : (err.message || "Internal server error.")
  });
}
