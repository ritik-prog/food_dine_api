const express = require('express')

const {getOrders, getOrder, deleteOrder, placeOrder, updateOrder} = require('../controllers/orders')

const router = express.Router()

router.route('/').get(getOrders).post(placeOrder)

router.route('/:id').get(getOrder).put(updateOrder).delete(deleteOrder)

module.exports = router