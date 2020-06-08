const crypto = require("crypto");
const { promisify } = require("util");
const ErrorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const sendEmail = require("./../utils/email");
const User = require("./../models/Users");

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const jsonToken = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
    res.cookie('jwt', jsonToken, cookieOptions);
  
    // Remove password from output
    user.password = undefined;
  
    res.status(statusCode).json({
      status: 'success',
      jsonToken,
      data: {
        user
      }
    });
  };

// @desc      Register user
// @route     POST /api/v1/users/signup
// @access    Public
exports.signUp = catchAsync (async (req, res, next) => {
    //Create a user
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,   
        role: req.body.role
    });

    // const jsonToken =  signToken(user._id);

    // res.status(201).json({
    //     success: true,
    //     jsonToken,
    //     data: {
    //         user
    //     }
    // })
    createSendToken(user, 201, res);
});

// // @desc      Register user
// // @route     POST /api/v1/usersß/login
// // @access    Public
exports.login = catchAsync (async (req, res, next) => {

    const { email, password } = req.body;

    // Verify is users entering valid credentials.
    if (!email || !password) {
        return next(new ErrorResponse(`please enter correct email or password`, 400))
    }

    //Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password, user.password))) {
        return next(new ErrorResponse(`Incorrect email or password`, 401));
    }

    // // sendTokenResponse(user, 200, res);
    // const jsonToken = signToken(user._id);

    // res.status(200).json({ success: true, jsonToken });
    createSendToken(user, 200, res);

});


exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
  
    if (!token) {
      return next(
        new ErrorResponse('You are not logged in! Please log in to get access.', 401)
      );
    }
  
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded)
  
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new ErrorResponse(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
  
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new ErrorResponse('User recently changed password! Please log in again.', 401)
      );
    }
  
    // // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    
    next();
  });

  exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      // roles ['admin', 'user']. role='user'
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorResponse('You do not have permission to perform this action', 403)
        );
      }
  
      next();
    };
  };

  exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new ErrorResponse('There is no user with email address.', 404));
    }
  
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
  
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
  
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });
  
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
  
      return next(
        new ErrorResponse('There was an error sending the email. Try again later!'),
        500
      );
    }
  });

  exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
  
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
  
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new ErrorResponse('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // const jsonToken = signToken(user._id);

    // res.status(200).json({ success: true, jsonToken });
  
   // 3) Update changedPasswordAt property for the user
   // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  });

  exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
  
    // 2) Check if POSTed current password is correct
    if ( ! (await user.matchPassword(req.body.passwordCurrent, user.password))) {
      return next(new ErrorResponse('Your current password is wrong.', 401));
    }
  
    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!
  
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  });
  
// // @desc      Log user out
// // @route     GET /api/v1/auth/logout
// // @access    Private
// exports.logout = catchAsync (async (req, res, next) => {
//     res.cookie("token", "none", {
//         expires: new Date(Date.now() + 10 * 1000),
//         httpOnly: true
//     })

//     res.status(200).json({ success: true, data: {} });
// });

// // @desc      GET the current logged in user
// // @route     POST /api/v1/auth/me
// // @access    Private
// exports.getMe = catchAsync (async (req, res, next) => {
//     const user = await User.findById(req.user.id);

//     res.status(200).json({ success: true, data: user });
// });


// // @desc      Update user details
// // @route     PUT /api/v1/auth/updatedetails
// // @access    Private
// exports.updateDetails = catchAsync (async (req, res, next) => {
//     const fieldsToUpdate = {
//         name: req.body.name,
//         email: req.body.email
//     };

//     const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
//         new: true,
//         runValidators: true
//     });

//     res.status(200).json({
//         success: true,
//         data: user
//     });
// });

// // @desc      Update password
// // @route     PUT /api/v1/auth/updatepassword
// // @access    Private
// exports.updatePassword = catchAsync (async (req, res, next) => {
//     const user = await User.findById(req.user.id).select('+password');

//     // Check current password
//     if (!(await user.matchPassword(req.body.currentPassword))) {
//         return next(new ErrorResponse('Password is incorrect', 401));
//     }

//     user.password = req.body.newPassword;
//     await user.save();

//     sendTokenResponse(user, 200, res);
// });


// // @desc      Forgot password
// // @route     POST /api/v1/users/forgotpassword
// // @access    Public
// exports.forgotPassword = catchAsync (async (req, res, next) => {
//     const user = await User.findOne({ email: req.body.email });

//     if (!user) {
//         return next(new ErrorResponse('There is no user with that email', 404));
//     }

//     // Get reset token
//     const resetToken = user.getResetPasswordToken();

//     await user.save({ validateBeforeSave: false });

//     // Create reset url
//     const resetUrl = `${req.protocol}://${req.get(
//         'host'
//     )}/api/v1/auth/resetpassword/${resetToken}`;

//     const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

//     try {
//         await sendEmail({
//             email: user.email,
//             subject: 'Password reset token',
//             message
//         });

//         res.status(200).json({ success: true, data: 'Email sent' });
//     } catch (err) {
//         console.log(err);
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;

//         await user.save({ validateBeforeSave: false });

//         return next(new ErrorResponse('Email could not be sent', 500));
//     }

//     res.status(200).json({
//         success: true,
//         data: user
//     });
// });


// // @desc      Reset password
// // @route     PUT /api/v1/auth/resetpassword/:resettoken
// // @access    Public
// exports.resetPassword = catchAsync (async (req, res, next) => {
//     // Get hashed token
//     const resetPasswordToken = crypto
//         .createHash('sha256')
//         .update(req.params.resettoken)
//         .digest('hex');

//     const user = await User.findOne({
//         resetPasswordToken,
//         resetPasswordExpire: { $gt: Date.now() }
//     });

//     if (!user) {
//         return next(new ErrorResponse('Invalid token', 400));
//     }

//     // Set new password
//     user.password = req.body.password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save();

//     sendTokenResponse(user, 200, res);
// });


// // Get JWT token from model, create cookie, and send response
// const sendTokenResponse = (user, statusCode, res) => {

//     // Create a token
//     const token = user.getSignedJwtToken();

//     const options = {
//         expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
//         httpOnly: true
//     };

//     res
//         .status(statusCode)
//         .cookie('token', token, options)
//         .json({ success: true, token })

// }