const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userType",
      required: true,
      index: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ["owner","maid"],
    },
    reviews: [
      {
        rating: { type: Number, required: true },
        comment: { type: String },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "userType",
          required: true,
          index: true,
        },
        userType: {
          type: String,
          required: true,
          enum: ["owner","maid"]
        },
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("rating", ratingSchema);
