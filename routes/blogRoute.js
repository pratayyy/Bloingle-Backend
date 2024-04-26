const express = require('express');

const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/get-upload-url').get(blogController.generateUploadUrl);

router.route('/get-blogs-count').get(blogController.getBlogCount);
router
  .route('/get-blogs-count/auth')
  .get(authController.protect, blogController.getBlogCount);

router
  .route('/get-user-like-status/:id')
  .get(authController.protect, blogController.getUserLikeStatus);

router
  .route('/get-user-blogs')
  .get(authController.protect, blogController.getAllBlog);

router
  .route('/')
  .get(blogController.getAllBlog)
  .post(authController.protect, blogController.createBlog);

router
  .route('/:id')
  .patch(authController.protect, blogController.updateBlogLike);

router.route('/:id/comments').get(blogController.getAllCommentsOnBlog);

router
  .route('/:slug')
  .get(blogController.getBlog)
  .delete(authController.protect, blogController.deleteBlog);

module.exports = router;
