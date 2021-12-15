const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

//CREATING A MULTER DISK STORAGE
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

//SAVING FILE TO MEMORY TO BE USED LATER
const multerStorage = multer.memoryStorage();

//CREATING A FILTER
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Image not uploaded, please try again', 400), false);
  }
};

//Configuring multer upload
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//Multer Middleware
exports.uploadUserPhoto = upload.single('photo');

exports.resizeImage = async (req, res, next) => {
  if (!req.file) return;

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newobj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newobj[el] = obj[el];
  });

  return newobj;
};

exports.getUsers = factory.getAll(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  //Return an error if the user tries to update passwords
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError('This is not a route for updating your password!', 400)
    );
  }

  //Updating the user
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id);

  res.status(204).json({
    status: 'success',
    data: {
      data: null,
    },
  });
});

exports.postUsers = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'Not yet implemented',
  });
};

exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
