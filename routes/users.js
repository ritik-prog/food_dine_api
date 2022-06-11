const express = require('express');

const userController = require('../controllers/users');

const { protect, restrictTo } = require('../controllers/restaurantsAuth');

const router = express.Router();

router
  .route('/')
  .get(protect, restrictTo('admin'), userController.getUsers)
  .post(protect, restrictTo('admin'), userController.createUser);

router
  .route('/admins')
  .get(protect, restrictTo('admin'), userController.getAdmins);

router
  .route('/:id')
  .get(protect, restrictTo('admin'), userController.getUser)
  .put(protect, restrictTo('admin'), userController.updateUser)
  .delete(protect, restrictTo('admin'), userController.deleteUser);

module.exports = router;
