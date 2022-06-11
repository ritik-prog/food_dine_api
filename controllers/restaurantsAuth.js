const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jsonwebtoken = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');
const sendMail = require('../utils/sendEmail');
const crypto = require('crypto');

const signToken = (id) => {
  return jsonwebtoken.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (restaurant, statusCode, res) => {
  const token = signToken(restaurant.id);
  res.status(statusCode).json({ success: true, token, restaurant });
};

exports.signup = catchAsync(async (req, res, next) => {
  console.log(req.body)
  const restaurant = await Restaurant.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(restaurant, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 401));
  }
  const restaurant = await Restaurant.findOne({ email: email }).select('+password');
  if (!restaurant || !restaurant.correctPassword(password, restaurant.password)) {
    return next(new AppError('Invalid Login', 401));
  }
  createSendToken(restaurant, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Token Doesnot Exist', 403));
  }

  // Not working
  // const decoded = await promisify(
  //   jsonwebtoken.verify(token, process.env.JWT_SECRET)
  // );
  //Using this line instead

  const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
  const restaurant = await Restaurant.findById(decoded.id);

  if (!restaurant) {
    return next(
      new AppError(`Restaurant with the id: ${decoded.id} doesn't exist`, 401)
    );
  }

  if (restaurant.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Password has been changed. Please login again', 401)
    );
  }
  req.restaurant = restaurant;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.restaurant.role)) {
      return next(
        new AppError('You are not authorized to carry out this action', 403)
      );
    }
    return next();
  };
};

exports.getMe = catchAsync(async (req, res, next) => {
  const restaurant = req.restaurant;
  res.status(200).json({ success: true, data: restaurant });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;

  const restaurant = req.restaurant;
  restaurant.name = name;
  restaurant.email = email;

  if (!name || !email) {
    return next(new AppError('Please enter name and email', 401));
  }

  await restaurant.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, data: restaurant });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const restaurant = req.restaurant;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  if (!password || !passwordConfirm) {
    return next(new AppError('Please enter password and passwordConfirm', 401));
  }
  const isPasswordCorrect = await restaurant.correctPassword(password, restaurant.password);

  if (!isPasswordCorrect) {
    return next(new AppError('Invalid Credientials', 403));
  }

  restaurant.password = password;
  restaurant.passwordConfirm = passwordConfirm;
  restaurant.passwordChangedAt = Date.now() - 1000;

  await restaurant.save();
  res.status(200).json({ success: true, data: restaurant });
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: Date.now() + 1000,
    httpOnly: true,
  });
  res
    .status(200)
    .json({ success: true, message: 'Successfully logged out', data: {} });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const restaurant = await Restaurant.findOne({ email });
  if (!restaurant) {
    return next(new AppError('Invalid email', 403));
  }
  const resetToken = restaurant.getPasswordResetToken();
  await restaurant.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You can reset your password with this link. If you have not requested this then please ignore. Link: ${resetUrl}`;

  try {
    //Sending email
    await sendMail({
      email: restaurant.email,
      subject: 'Password Reset Token',
      message,
    });
    //Sending response
    res.status(200).json({ success: true, message: 'Email Sent' });
  } catch (error) {
    restaurant.passwordResetToken = undefined;
    restaurant.passwordResetTokenExpiresIn = undefined;
    await restaurant.save({ validateBeforeSave: false });
    return next(new AppError('Error sending reset email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const restaurant = await Restaurant.findOne({
    resetPasswordToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });

  if (!restaurant) {
    return next(new AppError('Invalid Token', 401));
  }

  restaurant.password = req.body.password;
  restaurant.passwordConfirm = req.body.passwordConfirm;
  restaurant.passwordResetToken = undefined;
  restaurant.passwordResetTokenExpiresIn = undefined;

  await restaurant.save();
  createSendToken(restaurant, 200, res);
});
