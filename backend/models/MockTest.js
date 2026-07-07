const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    questionsAttempted: { type: Number, default: 0, min: 0 },
    correct: { type: Number, default: 0, min: 0 },
    timeTaken: { type: Number, default: 0, min: 0 }, // minutes
    score: { type: Number, default: 0 },
  },
  { _id: false }
);

const mockTestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    percentile: { type: Number, min: 0, max: 100 },
    totalScore: { type: Number, default: 0 },
    sections: {
      VARC: { type: sectionSchema, default: () => ({}) },
      DILR: { type: sectionSchema, default: () => ({}) },
      QA: { type: sectionSchema, default: () => ({}) },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MockTest", mockTestSchema);
