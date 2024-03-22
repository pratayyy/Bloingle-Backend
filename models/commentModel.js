const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'Blog',
    },
    blogAuthor: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'Blog',
    },
    comment: {
      type: String,
      required: true,
    },
    children: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Comment',
    },
    commentedBy: {
      type: mongoose.Schema.ObjectId,
      require: true,
      ref: 'User',
    },
    isReply: {
      type: Boolean,
    },
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
    },
  },
  {
    timestamps: {
      createdAt: 'commentedAt',
    },
  },
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
