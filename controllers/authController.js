const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    personalInfo: {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    },
  });

  user.personalInfo.password = undefined;
  user.googleAuth = undefined;

  res.status(200).json({
    status: 'success',
    user,
  });
});
