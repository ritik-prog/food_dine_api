const mongoose = require('mongoose')

const tableSchema = mongoose.Schema({
    no: {
        type: Number,
    },
    restaurantId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    isOccupied: {
        type: Boolean,
        required: true
    }
})

const Table = mongoose.model('Table', tableSchema)

module.exports = Table