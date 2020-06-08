const express = require("express");
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  aliasPopularBooks,
  booksStats
} = require("./../controllers/books");

const { protect, restrictTo } = require("./../controllers/auth");


const router = express.Router();

router.route("/alias-popular-books").get(aliasPopularBooks, getBooks);

router.route("/").get(protect, getBooks).post(protect, restrictTo("admin", "users"), createBook);

router.route("/books-stats").get(booksStats);

router
  .route("/:bookId")
  .get(getBook)
  .patch(protect, restrictTo("admin", "users"), updateBook)
  .delete(protect, restrictTo("admin"), deleteBook);

module.exports = router;
