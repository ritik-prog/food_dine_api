const Cart = require('../models/Cart')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const MenuItem = require('../models/MenuItems');

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
    cart.menuItems.append(req.params.id)
    var total = 0
    cart.menuItems.forEach(el => {
        const item = await MenuItem.findById(el._id)
        total += item.price
    })
    cart.total = total
    await cart.save()
    res.status(200).json({
        success: true,
        data: cart
    })
})

exports.removeItemFromCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findById(req.params.id)
    if(!cart) {
        return next(new AppError('Cart Not Found', 404))
    }
    cart.menuItems.forEach(el => {
        if(el.id === req.params.id) {
            cart.total -= el.price
            delete el
        }
    });
    await cart.save()
    res.status(200).json({
        success: true,
        data: cart
    })
})

exports.clearCart = catchAsync(async(req, res, next) => {
    const cart = await Cart.findById(req.params.id)
    if(!cart) {
        return next(new AppError('Cart Not Found', 404))
    }
    await cart.remove()
    res.status(200).json({
        success: true,
        data: {}
    })
})