const mongoose = require('mongoose')

const menuItemSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide an item name"],
        unique: [true, "Name already exists. Please provide another."]
    },
    description: {
        type : String,
        required: [true, "Please add a description"],
    },
    price: {
        type: Number,
        required: [true, "Please provide price for the item"]
    },
    quantity: {
        type: Number,
        default: 1
    },
    images: [String],
    restaurantId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Restaurant',
        required: true
    }
})

const MenuItem = mongoose.model('MenuItem', menuItemSchema)

module.exports = MenuItem