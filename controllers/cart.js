const Cart = require('../models/Cart')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// route - /api/v1/users/:userId/cart/
exports.viewCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findById(req.params.id)
    if(!cart) {
        return next(new AppError('Cart Not Found', 404))
    }
    res.status(200).json({
        success: true,
        data: cart
    })
})

// route - /api/v1/users/:userId/cart/:cartId/menuItem/:id
exports.addItemToCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findById(req.params.id)
    if(!cart) {
        return next(new AppError('Cart Not Found', 404))
    }
    cart.menuItems.append(r)
})

exports.removeItemFromCart = catchAsync()

exports.clearCart = catchAsync()