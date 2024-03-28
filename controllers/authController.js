const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    user: {
      name: user.personalInfo.name,
      username: user.personalInfo.username,
      photo: user.personalInfo.photo,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({ personalInfo: { name, email, password } });

  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ 'personalInfo.email': email }).select(
    '+personalInfo.password',
  );

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});
