const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const profileImagesNameList = [
  'Garfield',
  'Tinkerbell',
  'Annie',
  'Loki',
  'Cleo',
  'Angel',
  'Bob',
  'Mia',
  'Coco',
  'Gracie',
  'Bear',
  'Bella',
  'Abby',
  'Harley',
  'Cali',
  'Leo',
  'Luna',
  'Jack',
  'Felix',
  'Kiki',
];
const profileImagesCollectionsList = [
  'notionists-neutral',
  'adventurer-neutral',
  'fun-emoji',
];

const userSchema = mongoose.Schema(
  {
    personalInfo: {
      name: {
        type: String,
        required: [true, 'Please provide your name!'],
        minlength: [3, 'Name must be atleast 3 characters'],
      },
      email: {
        type: String,
        required: [true, 'Please provide your email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
      },
      password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
      },
      username: {
        type: String,
        minlength: [3, 'Username must be atleast 3 characters long'],
        unique: true,
      },
      bio: {
        type: String,
        maxlength: [200, 'Bio should be less than or equal to 200'],
        default: '',
      },
      photo: {
        type: String,
        default: () => {
          return `https://api.dicebear.com/6.x/${profileImagesCollectionsList[Math.floor(Math.random() * profileImagesCollectionsList.length)]}/svg?seed=${profileImagesNameList[Math.floor(Math.random() * profileImagesNameList.length)]}`;
        },
      },
    },
    socialLinks: {
      youtube: {
        type: String,
        default: '',
      },
      instagram: {
        type: String,
        default: '',
      },
      facebook: {
        type: String,
        default: '',
      },
      twitter: {
        type: String,
        default: '',
      },
      github: {
        type: String,
        default: '',
      },
      website: {
        type: String,
        default: '',
      },
    },
    accountInfo: {
      totalPosts: {
        type: Number,
        default: 0,
      },
      totalReads: {
        type: Number,
        default: 0,
      },
    },
    googleAuth: {
      type: Boolean,
      default: false,
    },
    blogs: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Blog',
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: 'joinedAt',
    },
  },
);

userSchema.pre('save', async function (next) {
  this.personalInfo.username = this.email.split('@')[0];
  this.personalInfo.password = bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
