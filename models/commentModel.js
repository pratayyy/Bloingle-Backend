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
    content: {
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
      default: false,
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

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'commentedBy',
    select: 'personalInfo.name personalInfo.username personalInfo.photo -_id',
  });

  next();
});

commentSchema.post('save', function () {
  this.populate({
    path: 'commentedBy',
    select: 'personalInfo.name personalInfo.username personalInfo.photo',
  });
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
