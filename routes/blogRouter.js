const express = require('express');
const blogController = require('../controllers/blogController');

const router = express.Router();

router.route('/get-upload-url').get(blogController.generateUploadUrl);

router.route('/').post(blogController.createBlog);

module.exports = router;
