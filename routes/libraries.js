const express = require("express");
const {
  getLibraries,
  getLibrary,
  createLibrary,
  updateLibrary,
  deleteLibrary
} = require("./../controllers/libraries");


const router = express.Router();

router.route("/").get(getLibraries).post(createLibrary);

router
  .route("/:sellerId")
  .get(getLibrary)
  .patch(updateLibrary)
  .delete(deleteLibrary);

module.exports = router;
