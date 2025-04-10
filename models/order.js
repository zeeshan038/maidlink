const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
    maidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Maid",
    },
    applicants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Maid",
      default: []
    }],
    orderId : {
      type: String,
      default: "",
    },
    location: {
      type: [Number],
      required: true,
    },
    duration: {
      type: String,
      default: "",
      required: true,
    },
    jobType: {
      type: String,
      default: "",
      required: true,
    },
    charges: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "in progress","completed", "canceled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
