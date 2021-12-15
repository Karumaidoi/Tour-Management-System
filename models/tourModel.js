const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have less or equal 40 characters long'],
      minlength: [10, 'A tour must have more or equal 10 characters long'],
      //   validate: [validator.isAlpha, 'A tour name should only contain letters']
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    slug: String,
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max Group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour should have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: 'A tour has to be easy, medium or difficult',
      },
    },
    startDates: {
      type: [String],
      required: [true, 'A tour must have startDates'],
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A tour rating must be above one'],
      max: [5, 'A tour rating must be 5 or less than 5'],
      set: (val) => Math.round(val * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a Price'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return this.price > val;
        },

        message: 'The ({VALUE}) must be lower than the products price',
      },
    },

    summary: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image'],
    },

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    secret: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GEOJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    //Embending locations to the tours model
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Populate our guides
tourSchema.pre('/^find/', function (next) {
  this.populate('guides');
  next();
});

tourSchema.pre('/^find/', function (next) {
  this.populate('reviews');
  next();
});

//Improved Read performance using Indexes, they hep query few doc for required query
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//they are never saved to DB
tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

//Using virtuals to pouplate our reviews data in tour Model
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//Document Middlewares
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

//FOR EMBENDING DATA TO OUR TOUR MODEL
// tourSchema.pre('save', async function(next) {
//    const guidesPromise = this.guides.map(async id => await User.findById(id));
//    this.guides = await Promise.all(guidesPromise);
// })

//Query Middleware
tourSchema.pre('/^find/', function (next) {
  this.find({ secret: { $ne: true } });
  this.start = Date.now();
  next();
});

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secret: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
