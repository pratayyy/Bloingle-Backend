const express = require('express');

const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/get-upload-url').get(blogController.generateUploadUrl);

router.route('/get-blogs-count').get(blogController.getBlogCount);

router
  .route('/get-user-like-status/:id')
  .get(authController.protect, blogController.getUserLikeStatus);

router
  .route('/')
  .get(blogController.getAllBlog)
  .post(authController.protect, blogController.createBlog);

router
  .route('/:id')
  .patch(authController.protect, blogController.updateBlogLike);

router.route('/:slug').get(blogController.getBlog);

module.exports = router;
