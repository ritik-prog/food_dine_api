const express = require('express')

const {getOrders, getOrder, deleteOrder, placeOrder, updateOrder, checkout} = require('../controllers/orders')

const router = express.Router()

router.route('/').get(getOrders).post(placeOrder)

router.route('/:id').get(getOrder).put(updateOrder).delete(deleteOrder)

router.get('/checkout', checkout)

module.exports = router