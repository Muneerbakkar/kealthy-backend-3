// middleware/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message,
    // Optionally include stack trace in development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
