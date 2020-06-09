const express = require("express");
const { signUp, login, protect, forgotPassword, resetPassword, updatePassword } = require("./../controllers/auth");
const { getUsers, createUser, updateMe, deleteMe } = require("./../controllers/users");

const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(login);

router.patch("/forgotpassword", protect, forgotPassword);
router.patch("/resetpassword/:token", protect, resetPassword);

router.patch("/updatepassword", protect, updatePassword);
router.patch("/updateme", protect, updateMe);

router.delete("/deleteme", protect, deleteMe);

router.route("/").get(getUsers).post(createUser);

// router.route("/:userId").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;