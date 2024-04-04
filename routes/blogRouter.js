const express = require('express');
const blogController = require('../controllers/blogController');

const router = express.Router();

router.get('/get-upload-url', blogController.generateUploadUrl);

module.exports = router;
