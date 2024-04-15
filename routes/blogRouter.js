const express = require('express');

const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/get-upload-url').get(blogController.generateUploadUrl);

router.route('/get-trending-blog').get(blogController.getTrendingBlog);

router.route('/get-blog-by-category').post(blogController.getBlogByCategory);

router
  .route('/')
  .get(blogController.getAllBlog)
  .post(authController.protect, blogController.createBlog);

module.exports = router;
