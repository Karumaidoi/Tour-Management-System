const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoute');

const route = express.Router();

route.use('/:tourId/reviews', reviewRouter);

route.param('id', (req, res, next, val) => {
  console.log(`The tour id is ${val}`);
  next();
});

route
  .route('/top-5-tours')
  .get(tourController.checkTour, tourController.getTours);

//Pipeline aggregation
route.route('/tour-stats').get(tourController.getStats);

//Using a protect middleware
route.use(authController.protect);

//Route for getting tours within a certain range a user is in
route
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

//Route for handling distances around a certain tour Location
route.route('/distances/:latlng/unit/:units').get(tourController.getDistances);

route
  .route('/monthly-plan/:year')
  .get(authController.restrictTo('admin'), tourController.getMonthlyPlan);

route
  .route('/')
  .get(tourController.getTours)
  .post(
    authController.restrictTo('admin', 'guide', 'lead-guide'),
    tourController.createTour
  );
route
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//Maiking a nested Route
//route.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

module.exports = route;
