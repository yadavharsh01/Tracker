const mongoose = require("mongoose");

const loginEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null },
});

module.exports = mongoose.model("LoginEvent", loginEventSchema);
