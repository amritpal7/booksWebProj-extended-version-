const express = require("express");
const morgan = require("morgan");

const errorResponse = require("./utils/errorResponse")
const globalErrorHandler = require("./controllers/error");
const app = express();

app.use(express.json());

console.log("mode: "+ process.env.NODE_ENV);
if(process.env.NODE_ENV==='development') {
  app.use(morgan("dev"));
}

app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers)
  next();
});

const reviewsRouter = require("./routes/reviews");
const librariesRouter = require("./routes/libraries");
const booksRouter = require("./routes/books");
const usersRouter  = require("./routes/users");

app.use("/api/v1/libraries", librariesRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/books", booksRouter);
app.use("/api/v1/users", usersRouter);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   success: false,
  //   message: `cannot load the page with route ${req.originalUrl}`
  // })

  // const err = new Error(`cannot load the page with route ${req.originalUrl}`);
  // err.status = "fail",
  // err.statusCode = 400

  next(new errorResponse(`cannot load the page with route ${req.originalUrl}`));
})

app.use(globalErrorHandler);

module.exports = app;
