const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

//To minimize the amount of requests done within a specified time
const rateLimiter = require('express-rate-limit');

const app = express();

//Requiring templates
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Serving public or static files
app.use(express.static(path.join(__dirname, 'public')));

//

//Setting our HTTP headers
app.use(helmet());

//Setting a rate limiting for our API Requests
const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again',
});

app.use('/api', limiter);

//Handling Routes and Error Handling
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoute');
const tourRouter = require('./routes/tourRoute');
const reviewRouter = require('./routes/reviewRoute');
const bookingRouter = require('./routes/bookingRoute');
const viewRouter = require('./routes/viewRouter');

//MiddleWares
//Passing data to our req.body
app.use(express.json({ limit: '10kb' }));

//FOR COOKIES
app.use(cookieParser());

//FOR PARSING DATA IN THE BODY ///USING FORMS
app.use(express.urlencoded({ extended: true }));

//Protecting against NOSQL NO INJECTION ATTACK
app.use(mongoSanitize());

//Protecting against XSS Attack
app.use(xss());

//Preventing Parameter Polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://cdnjs.cloudflare.com"
  );
  next();
});

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

//ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`The path ${req.originalUrl} does not exist`, 404));
});

//Error Middleware
app.use(globalErrorHandler);

module.exports = app;
