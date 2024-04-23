const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Comment = require('../models/commentModel');
const Blog = require('../models/blogModel');
const Notification = require('../models/notificationModel');

exports.createComment = catchAsync(async (req, res, next) => {
  const { user } = req;

  const { blogId, blogAuthor, content, replyingTo } = req.body;

  if (!content.length)
    return next(new AppError('Write something to leave a comment', 403));

  const commentObj = { blogId, blogAuthor, content, commentedBy: user };

  if (replyingTo) {
    commentObj.parent = replyingTo;
    commentObj.isReply = true;
  }

  const comment = await Comment.create(commentObj);

  comment.populate({
    path: 'commentedBy',
    select: 'personalInfo.name personalInfo.username personalInfo.photo',
  });

  await Blog.findByIdAndUpdate(
    { _id: blogId },
    {
      $push: { comments: comment._id },
      $inc: {
        'activity.totalComments': 1,
        'activity.totalParentComments': replyingTo ? 0 : 1,
      },
    },
  );

  const notificationObj = {
    type: replyingTo ? 'reply' : 'comment',
    blog: blogId,
    notificationFor: blogAuthor,
    user,
    comment: comment._id,
  };

  if (replyingTo) {
    notificationObj.repliedOnComment = replyingTo;

    const replyingToCommentDoc = await Comment.findOneAndUpdate(
      { _id: replyingTo },
      { $push: { children: comment._id } },
    );

    notificationObj.notificationFor = replyingToCommentDoc.commentedBy._id;
  }

  await Notification.create(notificationObj);

  res.status(201).json({
    status: 'success',
    comment,
  });
});

exports.getReplies = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { skip } = req.query;

  const comment = await Comment.findOne({ _id: id }).populate({
    path: 'children',
    options: { limit: 5, skip: skip, sort: { commentedAt: -1 } },
    populate: {
      path: 'commentedBy',
      select: 'personalInfo.name personalInfo.username personalInfo.photo',
    },
    select: '-updatedAt',
  });

  if (!comment) return next(new AppError('No comment found with that ID', 404));

  const replies = comment.children;

  res.status(200).json({
    status: 'success',
    replies,
  });
});

const deleteComments = async (id) => {
  const comment = await Comment.findOneAndDelete({ _id: id });

  if (comment.parent) {
    await Comment.findOneAndUpdate(
      { _id: comment.parent },
      { $pull: { children: id } },
    );
  }

  await Notification.findOneAndDelete({ comment: id });

  await Notification.findOneAndDelete({ reply: id });

  await Blog.findOneAndUpdate(
    { _id: comment.blogId },
    {
      $pull: { comments: id },
      $inc: {
        'activity.totalComments': -1,
        'activity.totalParentComments': comment.parent ? 0 : -1,
      },
    },
  );

  if (comment.children.length) {
    comment.children.forEach((replies) => {
      deleteComments(replies);
    });
  }
};

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { user } = req;

  const { id } = req.params;

  const comment = await Comment.findOne({ _id: id });

  if (!comment) return next(new AppError('No comment found with that ID', 404));

  if (
    user === comment.commentedBy.toString() ||
    user === comment.blogAuthor.toString()
  ) {
    await deleteComments(id);

    res.status(204).json({ status: 'success' });
  } else {
    return next(
      new AppError('User doesnot have access to delete comment', 403),
    );
  }
});
