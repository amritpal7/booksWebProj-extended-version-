const express = require("express");
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview
} = require("./../controllers/reviews");


const router = express.Router();

router.route("/").get(getReviews).post(createReview);

router
  .route("/:sellerId")
  .get(getReview)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;
