const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @route       : GET /api/v1/restaurants/:restaurantsId/tables
// @desc        : Get all Tables
// @access      : Public
exports.getTables = catchAsync(async (req, res, next) => {
  if (req.params.restaurantId) {
    const  restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return next(
        new AppError(
          `Restaurant with the Id: ${req.params.restaurantId} does not exist.`
        )
      );
    }
    const features = new APIFeatures(
      Table.find({ restaurantId: restaurant._id }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const table = await features.query;
    res.status(200).json({ success: true, count: table.length, data: table });
  } else {
    const features = new APIFeatures(Table.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const table = await features.query;
    res.status(200).json({ success: true, count: table.length, data: table });
  }
});

// @route       : GET /api/v1/restaurants/:id
// @desc        : Get a Table
// @access      : Public
exports.getTable = catchAsync(async (req, res, next) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    return next(
      new AppError(`Table not found with the Id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: table });
});

// @route       : POST /api/v1/restaurants/:restaurantId/tables
// @desc        : Create a Table
// @access      : Private
exports.createTable = catchAsync(async (req, res, next) => {
  console.log(req.params.restaurantId)
  req.body.restaurantId = req.params.restaurantId;
  const table = await Table.create(req.body);
  res.status(200).json({ success: true, data: table });
});

// @route       : PUT /api/v1/tables/:id
// @desc        : Update a Table
// @access      : Private
exports.updateTable = catchAsync(async (req, res, next) => {
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!table) {
    return next(
      new AppError(`Table not found with the Id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: table });
});

// @route       : DELETE /api/v1/tables/:id
// @desc        : Delete a Table
// @access      : Private
exports.deleteTable = catchAsync(async (req, res, next) => {
  const table = await Table.findByIdAndDelete(req.params.id);
  if (!table) {
    return next(
      new AppError(`Table not found with the Id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: {} });
});
