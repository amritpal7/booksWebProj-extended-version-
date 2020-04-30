const express = require("express");
const {
  getContributors,
  getContributor,
  createContributor,
  updateContributor,
  deleteContributor
} = require("./../controllers/contributors");


const router = express.Router();

router.route("/").get(getContributors).post(createContributor);

router
  .route("/:sellerId")
  .get(getContributor)
  .patch(updateContributor)
  .delete(deleteContributor);

module.exports = router;
