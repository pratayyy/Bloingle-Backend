const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A blog must have title'],
      maxlength: [40, 'A blog name must have less or equal then 40 characters'],
      minlength: [10, 'A blog name must have more or equal then 10 characters'],
    },
    slug: String,
    banner: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
      maxlength: [
        200,
        'A blog must have description less then or equal to 200 characters',
      ],
      // required: true
    },
    content: {
      type: [],
      // required: true
    },
    tags: {
      type: [String],
      // required: true
    },
    author: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'A blog must have a author'],
      ref: 'User',
    },
    activity: {
      totalLikes: {
        type: Number,
        default: 0,
      },
      totalComments: {
        type: Number,
        default: 0,
      },
      totalReads: {
        type: Number,
        default: 0,
      },
      totalParentComments: {
        type: Number,
        default: 0,
      },
    },
    comments: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Comment',
    },
    draft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: 'publishedAt',
    },
  },
);

blogSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
