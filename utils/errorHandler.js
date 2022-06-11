const AppError = require('./appError');

const sendDevelopmentError = (err, res) => {
  res.status(err.statusCode).json({
    message: err.name,
    status: err.status,
    stack: err.stack,
    error: err,
  });
};

const sendProductionError = (err, res) => {
  //Send Informative Error for only operational error because you don't want to leak programming error messages to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR: ', err);
    err.status(500).json({ status: 'error', message: 'Some went very wrong!' });
  }
};

const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicationError = (error) => {
  const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate Fields Value Entered: ${value}. Please Enter another value`;
  return new AppError(message, 400);
};

const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid Input Data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevelopmentError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicationError(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);

    sendProductionError(error, res);
  }
};
