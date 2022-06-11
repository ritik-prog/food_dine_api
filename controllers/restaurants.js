const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Restaurant = require('../models/Restaurant')
const APIFeatures = require('../utils/apiFeatures');

exports.getRestaurants = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Restaurant.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const restaurants = await features.query;
  res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
});


exports.getRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    return next(new AppError('Restaurant does not exist', 404));
  }
  res.status(200).json({ success: true, data: restaurant });
});

// updateProfile should be used instead of this. Hence, commented
// exports.updateRestaurant = catchAsync(async (req, res, next) => {
//   let restaurant = await Restaurant.findById(req.params.id);
//   if (!restaurant) {
//     return next(new AppError('Restaurant does not exist', 404));
//   }
  
//   restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   res.status(200).json({ success: true, data: restaurant });
// });

exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  let restaurant = await Restaurant.findById(req.params.id);
  if(!restaurant) {
    return next(new AppError('Restaurant does not exist', 404));
  }
  await restaurant.remove();
  res.status(200).json({ success: true, message: 'Restaurant Deleted' });
});
