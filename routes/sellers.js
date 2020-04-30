const express = require("express");
const {getSellers, getSeller, createSeller, updateSeller, deleteSeller} = require("./../controllers/sellers");

const router = express.Router();

router.route("/").get(getSellers).post(createSeller);

router
  .route("/:sellerId")
  .get(getSeller)
  .patch(updateSeller)
  .delete(deleteSeller);

  module.exports = router;