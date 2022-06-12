const mongoose = require('mongoose')
const Restaurant = require('./Restaurant')
const Table = require('./Table')
const MenuItem = require('./MenuItem')
const User = require('./User')

const orderSchema = mongoose.Schema({
    total: {
        type: Number,
    },
    restaurantId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    tableId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Table',
        required: true
    },
    mobileNumber: {
        type: Number,
        min: 1000000000,
        max: 9999999999,
        required: [true, "Please provide your mobile number to place your order"]
    },
    isPaymentComplete: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'ordered',
        enum: ['ordered', 'Preparing', 'Delivered', 'Cancelled'],
        required: [true, "Order must have a status"]
    },
    // userId: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'User',
    //     required: true
    // },
    menuItemsId: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Restaurant',
        required: true
    }
})

const Order = mongoose.model('Order', orderSchema)

