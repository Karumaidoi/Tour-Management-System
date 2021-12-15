const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => {
    console.log(`Error: ${err}`);
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`), 'utf-8');
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`),
  'utf-8'
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`), 'utf-8');

const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    console.log('New tours have been created in the database');
  } catch (err) {
    console.log(`ERROR, ${err}`);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log(`Documents deleted from the Database`);
  } catch (err) {
    console.log(`ERROR: ${err}`);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log('You run the import file');
