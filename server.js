const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection successful');
  });


process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    process.exit(1);
})

const { string } = require('prop-types');
const app = require('./app');

const port = process.env.PORT || 4400;
const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});

//Handling unhandled rejections
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  })

});

