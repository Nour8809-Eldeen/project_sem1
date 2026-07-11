const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (err.name === 'CastError' || err.name === 'ValidationError') {
    statusCode = 400;
  }

  if (err.code === 11000) {
    statusCode = 409;
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    data: null,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
