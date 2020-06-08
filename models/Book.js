const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Books title is required."],
    maxlength: [20, "Name cannot ve more than 50 characters"],
    trim: true,
    unique: true
    // validate: [validator.isAlpha, "Title should cotains only letters."]
  },
  slug: String,
  category: {
    type: String,
    required: [true, "add a category for a book."],
    enum: [
      "drama,",
      "engineering",
      "fable",
      "crime and detective",
      "fantasy",
      "mystery",
      "mythology",
      "science",
      "romance",
      "satire",
      "suspence/thriller",
      "comic/novel",
      "biography",
      "poetry",
      "IT",
      "novel"
    ]
  },
  author: {
    type: [String],
    required: [true, "Add a author's name."]
  },
  description: {
    type: String,
    maxlength: [400, "Description cannot be more than 400 characters."],
    trim: true
  },
  cover_image: {
    type: String,
    default: "no-photo.jpg",
  },
  images: {
    type: [String],
    default: "no-photo.jpg",
  },
  language: {
    type: String,
    required: [true, "Add language for a book."]
  },
  pages: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    default: null
  },
  price_discount: {
    type: Number,
    validate: {
      validator: function (val) {
        // This only points to current document on new document creation.
        return val < this.price;
      },
      message: "Discount price ({VALUE}) should not exceed actual price."
    }
  },
  area_landmark: {
    type: String,
    required: [true, "Add a landmark for a book's area."]
  },
  dimensions: String,
  ISBN: {
    type: String,
    unique: true,
  },
  publisher: {
    type: String,
    reqiured: [true, "Add a publisher name."]
  },
  published_year: {
    type: Number,
    required: false,
  },
  average_rating: {
    type: Number,
    default: 1.0,
    min: [1, "Average rating must be above 1.0"],
    max: [5, "Average rating must be below 5.0"]
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  is_new: {
    type: Boolean,
    default: true,
  },
  by_contributor: {
    type: Boolean,
    default: false,
  },
  by_library: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});


// Create a book's name slug
bookSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});


const Book = mongoose.model("Book", bookSchema);

module.exports = Book;