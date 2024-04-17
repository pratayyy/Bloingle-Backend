const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const filterObj = req.query;
  const filter = {};

  Object.keys(filterObj).forEach((key) => {
    filter[key] = new RegExp(filterObj[key], 'i');
  });

  const users = await User.find(filter)
    .select('personalInfo.name personalInfo.username personalInfo.photo ')
    .limit(50);

  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
});
