const express = require('express')

const tablesRouter = require('./tables')
const menuItemsRouter = require('./menuItems')

const router = express.Router()

const {
    getRestaurants,
    getRestaurant,
    deleteRestaurant
} = require('../controllers/restaurants')

router.use('/:restaurantId/tables', tablesRouter)
router.use('/:restaurantId/menuitems', menuItemsRouter)

router.get('/', getRestaurants)
router.get('/:id', getRestaurant)
router.delete('/:id', deleteRestaurant)

module.exports = router
