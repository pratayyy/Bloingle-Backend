const express = require('express');

const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/get-upload-url').get(blogController.generateUploadUrl);

router
  .route('/')
  .get(blogController.getAllBlog)
  .post(authController.protect, blogController.createBlog);

module.exports = router;
