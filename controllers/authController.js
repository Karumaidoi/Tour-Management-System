const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        // secure: true,
        httpOnly: true,
    };

    if (!process.env.NODE_ENV == 'development') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    //Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        firstName: req.body.name,
        lastName: req.body.name,
        userName: req.body.name,
        email: req.body.email,
        password: req.body.password,

    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 200, res);
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;

    //Check if password and email exist
    if (!email || !password) {
        return next(new AppError('Please provide an email and a password', 400));
    }

    //Check if the user exist and password is correct
    const user = await User.findOne({ email }).select('+password');

    //Comparing the passwords
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email and password', 401));
    }

    //Sending the token to the user
    createSendToken(user, 200, res);
});

exports.logOut = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        status: 'success',
    });
};

exports.protect = catchAsync(async(req, res, next) => {
    // Check if the token is there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError('You are not logged in.Please log in to get access', 401)
        );
    }

    //Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('The user belonging to this token does not exist', 401)
        );
    }

    //Check if the user changed the password after being issued with the token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('You recently changed your password. Please try again', 401)
        );
    }

    req.user = currentUser;
    res.locals.user = currentUser;

    //GRANT ACCESS TO THE TOURS ROUTE
    next();
});

//Checking if the USER is logged in
exports.isLoggedIn = async(req, res, next) => {
    // Check if the token is there
    if (req.cookies.jwt) {
        //Verify the token
        try {
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            //check if user still exist
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            //Check if the user changed the password after being issued with the token
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            res.locals.user = currentUser;

            //THERE IS A LOGGED IN USER
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

//USER ROLES AND PERMISSIONS
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You are not allowed to delete a tour', 403));
        }

        next();
    };
};

//PASSWORD RESSETIING
exports.forgotPassword = catchAsync(async(req, res, next) => {
    //Check the user by the email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError('The email address does not exist', 404));
    //make the token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
        //send an email to the user
        const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

        await new Email(user, resetURL).sendResetPassword();

        res.status(200).json({
            status: 'success',
            message: 'Token successfully sent',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                'There was a problem when sending the token, try again!',
                500
            )
        );
    }
});

exports.resetPassword = catchAsync(async(req, res, next) => {
    //Get the user by the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordTokenExpires: { $gt: Date.now() },
    });

    //Check the user and return an error if doesnt exist
    if (!user) {
        return next(new AppError('Token is invalid or has expired. ', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordTokenExpires = undefined;
    await user.save();

    //Update the password using PATCH

    //Login User with JWT TOKEN
    createSendToken(user, 200, res);
});

//Updating password while still the USER is logged in
exports.updatePassword = catchAsync(async(req, res, next) => {
    //Get the user from the collection
    const user = await User.findById(req.user.id).select('+password');

    //Check if posted password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }
    //Update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    //send the JWT to the user
    createSendToken(user, 200, res);
});