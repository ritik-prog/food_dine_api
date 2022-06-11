const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/User');
const sendMail = require('../utils/sendEmail');
const crypto = require('crypto');

const signToken = (id) => {
  return jsonwebtoken.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  res.status(statusCode).json({ success: true, token, user });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 401));
  }
  const user = await User.findOne({ email: email }).select('+password');
  if (!user || !user.correctPassword(password, user.password)) {
    return next(new AppError('Invalid Login', 401));
  }
  createSendToken(user, 200, res);
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

  
  const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(
      new AppError(`User with the id: ${decoded.id} doesn't exist`, 401)
    );
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Password has been changed. Please login again', 401)
    );
  }
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not authorized to carry out this action', 403)
      );
    }
    return next();
  };
};

exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({ success: true, data: user });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;

  const user = req.user;
  user.name = name;
  user.email = email;

  if (!name || !email) {
    return next(new AppError('Please enter name and email', 401));
  }

  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, data: user });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = req.user;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  if (!password || !passwordConfirm) {
    return next(new AppError('Please enter password and passwordConfirm', 401));
  }
  const isPasswordCorrect = await user.correctPassword(password, user.password);

  if (!isPasswordCorrect) {
    return next(new AppError('Invalid Credientials', 403));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordChangedAt = Date.now() - 1000;

  await user.save();
  res.status(200).json({ success: true, data: user });
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
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Invalid email', 403));
  }
  const resetToken = user.getPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You can reset your password with this link. If you have not requested this then please ignore. Link: ${resetUrl}`;

  try {
    //Sending email
    await sendMail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });
    //Sending response
    res.status(200).json({ success: true, message: 'Email Sent' });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error sending reset email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid Token', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;

  await user.save();
  createSendToken(user, 200, res);
});
