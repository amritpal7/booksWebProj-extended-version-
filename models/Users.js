const crypto = require("crypto");
const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        lowercase: true,
        // match: [
        //     /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        //     "Please add a valid email"
        // ]
        validate: [validator.isEmail, "Email is not valid. Please enter a valid email id."]
    },
    photo: {
        type: String,
        default: "no-photo.jpg"
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: 6,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        minlength: 6,
        // This only works on  CREATE && 💯 Save 💯!!!
        validate: {
            validator: function (el) {
                return el === this.password;
            },
             message: "Passwords are not same!!!"
        },
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {

    // Only runs if the password is actually modified.
    if (!this.isModified("password")) {
        next();
    }
    // Hash the password with the cost of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Delete password confirm field
    this.passwordConfirm = undefined;
    next();
});

UserSchema.pre("save", function () {
    if (!this.isModified("password") || this.new)  
     return next();
    
    this.passwordChangedAt = Date.now() - 1000;
    next();
})


// Sign JWT and return
// UserSchema.methods.getSignedJwtToken = function () {
//     return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRE_IN
//     });
// };

UserSchema.methods.matchPassword = async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };

// Match user entered password to hashed password in database
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };

  UserSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };

// // Generate and hash password token
// UserSchema.methods.getResetPasswordToken = function () {

//     // Generate token
//     const resetToken = crypto.randomBytes(20).toString("hex");

//     // Hash token and set to resetPasswordToken field
//     this.resetPasswordToken = crypto
//         .createHash("sha256")
//         .update(resetToken)
//         .digest("hex");

//     // Set expire
//     this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

//     return resetToken;
// };

module.exports = mongoose.model("User", UserSchema);
