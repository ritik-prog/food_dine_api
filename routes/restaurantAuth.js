const express = require('express');

const authController = require('../controllers/restaurantsAuth');

const router = express.Router();

router.post('/login', authController.login);

router.post('/signup', authController.signup);

router.get('/me', authController.protect, authController.getMe);

router.post('/updateme', authController.protect, authController.updateMe);

router.get('/logout', authController.protect, authController.signup);

router.post('/forgetpassword', authController.forgotPassword);
router.post('/resetpassword/:resettoken', authController.forgotPassword);

router.post(
  '/updatepassword',
  authController.protect,
  authController.updatePassword
);

module.exports = router;
