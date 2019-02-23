const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const reviewSchema = new Schema({
    email: String,
    password: String,
    fullName: String,
    imageUrl: String,
    facebookID: String,
    googleID: String
}, {
  timestamps: true
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;