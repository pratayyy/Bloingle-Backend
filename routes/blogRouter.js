const express = require('express');

const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/get-upload-url').get(blogController.generateUploadUrl);

router.route('/get-trending-blog').get(blogController.getTrendingBlog);

router.route('/get-blogs-count').get(blogController.getBlogCount);
router.route('/get-blogs-count/:category').get(blogController.getBlogCount);

router
  .route('/')
  .get(blogController.getAllBlog)
  .post(authController.protect, blogController.createBlog);

router.route('/:category').get(blogController.getBlogByCategory);

module.exports = router;
