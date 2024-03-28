const jwt = require('jsonwebtoken');
const { getAuth } = require('firebase-admin/auth');

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
    data: {
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

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.googleAuth) {
    return next(
      new AppError(
        'This email was signed up with Google. Please log in with Google.',
        401,
      ),
    );
  }

  if (!(await user.correctPassword(password))) {
    return next(new AppError('Incorrect password', 401));
  }

  createSendToken(user, 200, res);
});

exports.googleAuth = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  const decodedUser = await getAuth().verifyIdToken(token);

  const { email, name } = decodedUser;

  let { picture } = decodedUser;
  picture = picture.replace('s96-c', 's384-c');

  let user = await User.findOne({ 'personalInfo.email': email }).select(
    'personalInfo.name personalInfo.username personalInfo.photo googleAuth',
  );

  if (user) {
    if (!user.googleAuth) {
      return next(
        new AppError(
          'This email was signed up without google. Please log in with password!',
          403,
        ),
      );
    }
  } else {
    user = await User.create({
      personalInfo: { name, email, photo: picture },
      googleAuth: true,
    });
  }

  if (!user) {
    return next(
      new AppError(
        'Failed to authenticate you with google. Try with other account or method',
        500,
      ),
    );
  }

  createSendToken(user, 200, res);
});
