const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google-auth', authController.googleAuth);

router.route('/').get(userController.getAllUsers);

router.route('/:username').get(userController.getUser);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMyPhoto', userController.updateUserPhoto);

module.exports = router;
