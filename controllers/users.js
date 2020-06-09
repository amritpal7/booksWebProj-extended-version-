const catchAsync = require("./../utils/catchAsync");
const errorResponse = require("./../utils/errorResponse");
const User = require("./../models/Users");


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getUsers = catchAsync (async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    data: {
      users
    }
  });
});


exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new errorResponse(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false }, { new: true, runValidators: true});

  res.status(204).json({
    success: true,
    data: null
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

