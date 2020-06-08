const express = require("express");
const { signUp, login, protect, forgotPassword, resetPassword, updatePassword } = require("./../controllers/auth");
const { getUsers, createUser } = require("./../controllers/users");

const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(login);

router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:token").patch(resetPassword);

router.route("/updatepassword").patch(protect,  updatePassword);

router.route("/").get(getUsers).post(createUser);

// router.route("/:userId").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;