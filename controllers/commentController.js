const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Comment = require('../models/commentModel');
const Blog = require('../models/blogModel');
const Notification = require('../models/notificationModel');

exports.createComment = catchAsync(async (req, res, next) => {
  const { user } = req;

  const { blogId, blogAuthor, content } = req.body;

  if (!content.length)
    return next(new AppError('Write something to leave a comment', 403));

  const comment = await Comment.create({
    blogId,
    blogAuthor,
    content,
    commentedBy: user,
  });

  await Blog.findByIdAndUpdate(
    { _id: blogId },
    {
      $push: { comments: comment._id },
      $inc: { 'activity.totalComments': 1, 'activity.totalParentComments': 1 },
    },
  );

  await Notification.create({
    type: 'comment',
    blog: blogId,
    notificationFor: blogAuthor,
    user,
    comment: comment._id,
  });

  res.status(201).json({
    status: 'success',
    comment,
  });
});
