const aws = require('aws-sdk');
const { nanoid } = require('nanoid');

const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

const s3 = new aws.S3({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

exports.generateUploadUrl = catchAsync(async (req, res, next) => {
  const imageName = `${nanoid()}-${new Date().getTime()}.jpeg`;

  const url = await s3.getSignedUrlPromise('putObject', {
    Bucket: 'bloingle',
    Key: imageName,
    Expires: 1000,
    ContentType: 'image/jpeg',
  });

  res.status(200).json({
    status: 'success',
    uploadUrl: url,
  });
});

exports.createBlog = catchAsync(async (req, res, next) => {
  const author = req.user;
  const { title, banner, description, tags, content, draft } = req.body;

  const blog = await Blog.create({
    title,
    banner,
    description,
    tags,
    content,
    author,
    draft: Boolean(draft),
  });

  await User.findByIdAndUpdate({ _id: author }, { $push: { blogs: blog._id } });

  res.status(201).json({
    status: 'success',
    blog,
  });
});

exports.getBlogCount = catchAsync(async (req, res, next) => {
  const filter = { draft: false, ...req.query };

  const totalDocs = await Blog.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    totalDocs,
  });
});

exports.getAllBlog = catchAsync(async (req, res, next) => {
  const filter = { draft: false };

  const features = new APIFeatures(Blog.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const blogs = await features.query;

  res.status(200).json({
    status: 'success',
    results: blogs.length,
    blogs,
  });
});
