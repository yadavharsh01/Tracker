const mongoose = require("mongoose");

const sectionalTestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    section: {
      type: String,
      enum: ["VARC", "DILR", "QA"],
      required: true,
    },
    testName: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    questionsAttempted: { type: Number, default: 0, min: 0 },
    correct: { type: Number, default: 0, min: 0 },
    timeTaken: { type: Number, default: 0, min: 0 }, // minutes
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SectionalTest", sectionalTestSchema);
