const express = require('express');

const authController = require('../controllers/authController');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/get-new-notification')
  .get(notificationController.getNewNotifications);

router.route('/get-count').get(notificationController.getAllNotificationsCount);

router.route('/').get(notificationController.getAllNotifications);

module.exports = router;
