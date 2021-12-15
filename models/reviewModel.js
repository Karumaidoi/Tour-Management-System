const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review can not be empty'],
    },

    rating: {
      type: Number,
      max: 5,
      min: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'a review must have an author'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Making the user onlt to make a single review on a single tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcRating = async function (tourId) {
  const statsRating = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(statsRating);
  if (statsRating.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: statsRating[0].nRating,
      ratingsQuantity: statsRating[0].avgRating,
    });
  } else {
    ratingsAverage: 0;
    ratingsQuantity: 4.5;
  }
};

reviewSchema.post('save', function () {
  //this points to the current document
  this.constructor.calcRating(this.tour);
});

reviewSchema.pre('/^findOneAnd/', async function (next) {
  this.review = await this.findOne();
});

reviewSchema.post('/^findOneAnd/', async function () {
  await this.review.constructor.calcRating(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
