const MenuItem = require('../models/MenuItems');
const Restaurant = require('../models/Restaurant');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @route       : GET /api/v1/menuItems
// @route       : GET /api/v1/restaurants/:restaurantsId/menuItems
// @desc        : Get all MenuItems
// @access      : Public
exports.getMenuItems = catchAsync(async (req, res, next) => {
  if (req.params.restaurantId) {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return next(
        new AppError(
          `Restaurant with the Id: ${req.params.restaurantId} does not exist.`
        )
      );
    }
    const features = new APIFeatures(
      MenuItem.find({ restaurantId: restaurant._id }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const menuItems = await features.query;
    res.status(200).json({ success: true, count: menuItems.length, data: menuItems });
  } else {
    const features = new APIFeatures(MenuItem.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const menuItems = await features.query;
    res.status(200).json({ success: true, count: menuItems.length, data: menuItems });
  }
});

// @route       : GET /api/v1/restaurants/:id
// @desc        : Get a Menu Item
// @access      : Public
exports.getMenuItem = catchAsync(async (req, res, next) => {
  const menuItem = await MenuItem.findById(req.params.id);
  if (!menuItem) {
    return next(
      new AppError(`Menu Item not found with the Id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: menuItem });
});

// @route       : POST /api/v1/restaurants/:restaurantId/menuitems
// @desc        : Create a Menu Item
// @access      : Private
exports.createMenuItem = catchAsync(async (req, res, next) => {
  req.body.restaurantId = req.params.restaurantId;
  const menuItem = await MenuItem.create(req.body);
  res.status(200).json({ success: true, data: menuItem });
});

// @route       : PUT /api/v1/menuitems/:id
// @desc        : Update a MenuItem
// @access      : Private
exports.updateMenuItem = catchAsync(async (req, res, next) => {
  const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!menuItem) {
    return next(
      new AppError(`Menu Item not found with the Id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: menuItem });
});

// @route       : DELETE /api/v1/menuitems/:id
// @desc        : Delete a Menu Item
// @access      : Private
exports.deleteMenuItem = catchAsync(async (req, res, next) => {
  const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
  if (!menuItem) {
    return next(
      new AppError(`Menu Item not found with the Id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: {} });
});
