const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: String,
  duration: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Session", sessionSchema);