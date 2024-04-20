const aws = require('aws-sdk');
const { nanoid } = require('nanoid');

const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

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
  const { title, banner, description, tags, content, draft, slug } = req.body;
  let blog;

  if (slug) {
    blog = await Blog.findOneAndUpdate(
      { slug },
      { title, banner, description, tags, content, draft: Boolean(draft) },
    );
  } else {
    blog = await Blog.create({
      title,
      banner,
      description,
      tags,
      content,
      author,
      draft: Boolean(draft),
    });

    const incrementValue = draft ? 0 : 1;

    await User.findByIdAndUpdate(
      { _id: author },
      {
        $inc: { 'accountInfo.totalPosts': incrementValue },
        $push: { blogs: blog._id },
      },
    );
  }

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

exports.getBlog = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const { draft, mode } = req.query;

  const incrementValue = mode !== 'edit' ? 1 : 0;

  const blog = await Blog.findOneAndUpdate(
    { slug },
    { $inc: { 'activity.totalReads': incrementValue } },
  );

  if (!blog) return next(new AppError('Blog doesnot exist', 404));

  await User.findOneAndUpdate(
    { 'personalInfo.username': blog.author.personalInfo.username },
    { $inc: { 'accountInfo.totalReads': incrementValue } },
  );

  if (blog.draft && !draft)
    return next(new AppError('You cannot access draft blogs', 500));

  res.status(200).json({
    status: 'success',
    blog,
  });
});

exports.updateBlogLike = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;
  const { isLikedByUser } = req.body;

  const incrementValue = !isLikedByUser ? 1 : -1;

  const blog = await Blog.findByIdAndUpdate(
    { _id: id },
    { $inc: { 'activity.totalLikes': incrementValue } },
  );

  if (!isLikedByUser) {
    const notification = await Notification.create({
      type: 'like',
      blog: id,
      notificationFor: blog.author._id,
      user,
    });

    res.status(200).json({
      status: 'success',
      notification,
      likedByUser: true,
    });
  } else {
    await Notification.findOneAndDelete({ user, type: 'like', blog: id });

    res.status(200).json({
      status: 'success',
      notification: null,
      likedByUser: false,
    });
  }
});

exports.getUserLikeStatus = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  const result = await Notification.exists({ user, type: 'like', blog: id });

  res.status(200).json({
    status: 'success',
    result,
  });
});
