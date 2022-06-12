const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @route       : GET /api/v1/orders
// @route       : GET /api/v1/restaurants/:restaurantId/orders
// @desc        : Get all Orders
// @access      : Public
exports.getOrders = catchAsync(async (req, res, next) => {
  if (req.params.restaurantId) {
    const restrauant = await Restaurant.findById(req.params.restaurantId);
    if (!restrauant) {
      return next(
        new AppError(
          `Restaurant with the Id: ${req.params.restaurantId} does not exist.`
        )
      );
    }
    const features = new APIFeatures(
      Order.find({ category: category._id }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
      
    const orders = await features.query;
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } else {
    res.status(400).json({
        success: false,
        message: 'Not Allowed. Only Available for Admins'
    })
  }
});

// @route       : GET /api/v1/orders/:id
// @desc        : Get a order
// @access      : Public
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new AppError(`Order not found with the Id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: order });
});

// @route       : POST /api/v1/restaurant/:restaurantId/orders
// @desc        : Create a Order
// @access      : Private
exports.placeOrder = catchAsync(async (req, res, next) => {
  req.body.restaurantId = req.params.restaurantId;
  const order = await Order.create(req.body);
  res.status(200).json({ success: true, data: order });
});

// @route       : PUT /api/v1/orders/:id
// @desc        : Update a Order
// @access      : Private
exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!order) {
    return next(
      new AppError(`Order not found with the Id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: order });
});

// @route       : DELETE /api/v1/orders/:id
// @desc        : Cancel A Order
// @access      : Private
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    return next(
      new AppError(`Order not found with the Id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: {} });
});
