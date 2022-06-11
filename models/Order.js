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
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    menuItemsId: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Restaurant',
        required: true
    }
})

const Order = mongoose.model('Order', orderSchema)

