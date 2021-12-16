const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const tourController = require('./../controllers/tourController');

const route = express.Router();

route.post('/signup', authController.signup);
route.post('/login', authController.login);
route.get('/logout', authController.logOut);
route.post('/forgotPassword', authController.forgotPassword);
route.patch('/resetPassword/:token', authController.resetPassword);

//Using  a middleware that protect all the other middleware
route.use(authController.protect);

route.get('/me', userController.getMe, userController.getUser);

route.post('/addproduct', tourController.createTour);

route.patch('/updatePassword', authController.updatePassword);

route.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeImage,
  userController.updateMe
);
route.delete('/deleteMe', userController.deleteMe);

//Protecting the router to the admin
route.use(authController.restrictTo('admin'));

route.route('/').get(userController.getUsers).post(userController.postUsers);
route
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = route;
