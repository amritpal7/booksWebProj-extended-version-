const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const sellersRouter = require("./routes/sellers");
const usersRouter = require("./routes/users");
const contributorsRouter = require("./routes/contributors");
const reviewsRouter = require("./routes/reviews");
const librariesRouter = require("./routes/libraries");
const booksRouter = require("./routes/books");

app.use("/api/v1/sellers", sellersRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/contributors", contributorsRouter);
app.use("/api/v1/libraries", librariesRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/books", booksRouter);

module.exports = app;
