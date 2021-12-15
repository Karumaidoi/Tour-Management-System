const AppError = require('./../utils/appError');

const handleErrorDuplicate = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `The value ${value} is duplicated field and cannot be updated`;

  return new AppError(message, 404);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 404);
};

const handleJsonWebToken = (err) => {
  return new AppError('Invalid Details, Please try again!', 401);
};

const handleTokenExpiry = (err) => {
  return new AppError('YOur session has expired', 401);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    console.log(err);
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
      });
    } else {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again sometime later!',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.code === 11000) error = handleErrorDuplicate(error);
    if (err.name === 'ValidatorError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJsonWebToken(error);
    if (err.name === 'TokenExpiredError') error = handleTokenExpiry(error);
    sendErrorProd(err, req, res);
  }
};
