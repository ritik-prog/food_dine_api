const express = require('express')

const router = express.Router({mergeParams: true})

const {
        getMenuItem,
        getMenuItems,
        createMenuItem,
        deleteMenuItem,
        updateMenuItem
    } = require('../controllers/menuItems')

router.route('/')
                .get(getMenuItems)
                .post(createMenuItem)

router.route('/:id')
                    .get(getMenuItem)
                    .put(updateMenuItem)
                    .delete(deleteMenuItem)

module.exports = router