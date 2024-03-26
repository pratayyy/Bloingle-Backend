const User = require('../models/userModel');

exports.signup = async (req, res) => {
  await User.create({
    personalInfo: {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    },
  });

  return res.status(200).json({ status: 'success' });
};
