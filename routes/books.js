const express = require("express");
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
} = require("./../controllers/books");


const router = express.Router();

router.route("/").get(getBooks).post(createBook);

router
  .route("/:sellerId")
  .get(getBook)
  .patch(updateBook)
  .delete(deleteBook);

module.exports = router;
