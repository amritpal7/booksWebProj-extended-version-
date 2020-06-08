const Book = require("./../models/Book");
const APIfeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/errorResponse");


exports.aliasPopularBooks = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "-average_rating,price";
    req.query.fields = "title,authors,price,description,average_rating";
    next();
}

// @desc      Get books
// @route     GET /api/v1/books
// @route     GET /api/v1/registeredUers/:registeredUserId/books
// @access    Public
exports.getBooks = catchAsync( async (req, res, next) => {
    // // Build the query
    // const queryObj = { ...req.query };
    // const excludedFields = [ 'page', 'limit', 'sort', 'fields' ];
    // excludedFields.forEach(el => delete queryObj[el]);
    // console.log(req.query, queryObj)

    // // Advanced filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gt|gte|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.stringify(queryStr));

    // let query = Book.find(JSON.parse(queryStr));

    // // Sorting the fields
    // if(req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort("created_at");
    // }

    // // Limiting the fields
    // if(req.query.fields){
    //   const selectedFields = req.query.fields.split(',').join(' ');
    //   query = query.select(selectedFields);
    // }

    // // Pagonation
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if(req.query.page) {
    //   const numBooks = await Book.countDocuments();
    //   if(skip >= numBooks) {
    //     throw Error("This page doesn't exist!");
    //   }
    // }
    // Excuting the query
    const features = new APIfeatures(Book.find(), req.query).filter().sort().limit().paginate();
    const books = await features.query;
    res.status(200).json({
      success: true,
      requesedtAt: req.requestTime,
      total_results: books.length,
      data: {books}
    })
});

// @desc      Get single book
// @route     GET /api/v1/books/:id
// @access    Public
exports.getBook = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.bookId);

    if(!book) {
      return next (new AppError("Book not found with this ID", 404));
    }
    res.status(200).json({
      success: true,
      data: {book}
    });
});


exports.createBook = catchAsync(async (req, res, next) => {
    const book = await Book.create(req.body);
    res.status(201).json({
      success: true,
      requesedtAt: req.requestTime,
      data: {book}
    });
});

exports.updateBook = catchAsync(async (req, res, next) => {
  const book = Book.findByIdAndUpdate(req.params.bookId, req.body, {
    new: true,
    runValidators: true
  });

  if (!book) {
    return next(new AppError("Book not found with this ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {book}
  });
});

exports.deleteBook = catchAsync (async (req, res, next) => {
  const book = await Book.findByIdAndRemove(req.params.bookId);

  if (!book) {
    return next(new AppError("Book not found with this ID", 404));
  }

  res.status(204).json({
    success: true,
    requesedtAt: req.requestTime,
    data: {},
    message: "Book deleted Successfully!"
  });
});

exports.booksStats = catchAsync( async (req, res) => {
    const stats = await Book.aggregate([
      {
        $match: { average_rating: { $gte: 2 } }
      },
      {
        $group: {
          _id: { $toUpper: "$category"},
          numBooks: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$average_rating" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: "FABLE" }   }
      // }
    ])
    res.status(200).json({
      success: true,
      data: {stats}
    })
});