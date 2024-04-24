const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const filter = {};

  const features = new APIFeatures(User.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const user = await User.findOne({ 'personalInfo.username': username });

  if (!user) return next(new AppError('No user found with that username', 404));

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.updateUserPhoto = catchAsync(async (req, res, next) => {
  const { url } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user,
    {
      'personalInfo.photo': url,
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    photo: updatedUser.personalInfo.photo,
  });
});
