const express = require('express')

const router = express.Router({mergeParams: true})

const {
    getTables,
    getTable,
    createTable,
    updateTable,
    deleteTable
} = require('../controllers/tables')

router.route('/')
                .get(getTables)
                .post(createTable)

router.route('/:id')
                    .get(getTable)
                    .put(updateTable)
                    .delete(deleteTable)

module.exports = router