//NPM Pacakages
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 800 }, 
});

module.exports = mongoose.model("OTP", otpSchema);
