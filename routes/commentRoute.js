const express = require('express');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.route('/').post(authController.protect, commentController.createComment);

router.route('/:blogId').get(commentController.getComments);

module.exports = router;
