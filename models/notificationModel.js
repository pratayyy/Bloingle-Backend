const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['like', 'comment', 'reply'],
      required: true,
    },
    blog: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'Blog',
    },
    notificationFor: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'User',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'User',
    },
    comment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
    },
    reply: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
    },
    repliedOnComment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
