const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  //Await the data from the Tours to arrive
  const tours = await Tour.find();
  //Template the data

  //Send the data in our route
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //Get the Data
  const tour = await Tour.findOne({ slug: req.params.slug })
    .populate({
      path: 'reviews',
    })
    .populate({
      path: 'guides',
    });

  if (!tour) return next(new AppError('There is no tour with that name', 404));
  //Template the data
  // console.log(tour);
  //Send the data in our route
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

//Logging in our user in our Views
exports.logIn = async (req, res) => {
  // console.log(req.body);
  //Send the data
  res.status(200).render('login', {
    title: 'Log in to your account',
  });
};

exports.addProduct = async (req, res) => {
  // console.log(req.body);
  //Send the data
  res.status(200).render('addproduct', {
    title: 'Add a product',
  });
};

exports.signup = async (req, res) => {
  // console.log(req.body);
  //Send the data
  res.status(200).render('signup', {
    title: 'Create an account',
  });
};

//
exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const toursId = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: toursId } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

//
exports.getAccount = async (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUser = catchAsync(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updateUser,
  });
});
