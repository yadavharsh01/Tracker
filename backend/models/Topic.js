const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    section: {
      type: String,
      enum: ["QA", "VARC", "DILR"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    mastery: {
      type: String,
      enum: ["not_started", "learning", "mastered"],
      default: "not_started",
    },
    lastRevisedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent the same topic name being added twice under the same section for a user.
topicSchema.index({ userId: 1, section: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Topic", topicSchema);
