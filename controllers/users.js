const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/User');
const APIFeatures = require('../utils/apiFeatures');

exports.getUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;
  res.status(200).json({ success: true, count: users.length, data: users });
});

exports.getAdmins = catchAsync(async (req, res, next) => {
  const users = await User.find({ role: 'admin' });
  res.status(200).json({ success: true, count: users.length, data: users });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User does not exist', 404));
  }
  res.status(200).json({ success: true, data: user });
});

exports.createUser = catchAsync(async (req, res, next) => {
  if (req.body.role === 'admin') {
    return new AppError('user role cannot be set to admin', 401);
  }
  const user = await User.create(req.body);
  res.status(200).json({ success: true, data: user });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User does not exist', 404));
  }
  if (req.body.role === 'admin') {
    return next(new AppError('user role cannot be set to admin', 401));
  }
  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (user.role === 'admin') {
    return next(
      new AppError(`User with role ${user.role} cannot be deleted.`, 401)
    );
  }
  await user.remove();
  res.status(200).json({ success: true, message: 'User Deleted' });
});
