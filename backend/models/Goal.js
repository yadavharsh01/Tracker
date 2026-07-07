const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    period: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
    targetMinutes: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

// One goal document per user per period type — creating a new goal for
// a period the user already has replaces the old target.
goalSchema.index({ userId: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("Goal", goalSchema);
