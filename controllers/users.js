const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/Users");

exports.getUsers = catchAsync (async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    data: {
      users
    }
  });
});

exports.getUser = (req, res, next) => {
  res.status(500).json({
    success: "error",
    message: "Route not defined yet!",
  });
};

exports.createUser = (req, res, next) => {
  res.status(500).json({
    success: "error",
    message: "Route not defined yet!",
  });
};

exports.updateUser = (req, res, next) => {
  res.status(500).json({
    success: "error",
    message: "Route not defined yet!",
  });
};

exports.deleteUser = (req, res, next) => {
  res.status(500).json({
    success: "error",
    message: "Route not defined yet!",
  });
};
