const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  totalHours: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: Date,

  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },

  examDate: { type: Date, default: null },
  targetPercentile: { type: Number, default: null },

  resetPasswordTokenHash: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
});

module.exports = mongoose.model("User", userSchema);