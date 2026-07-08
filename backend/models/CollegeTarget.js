const mongoose = require("mongoose");

const collegeTargetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collegeName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["targeting", "shortlisted", "wat_pi_scheduled", "selected", "waitlisted", "rejected"],
      default: "targeting",
    },
    cutoffPercentile: { type: Number, default: null }, // reference: what this college typically needs
    watPiDate: { type: Date, default: null },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CollegeTarget", collegeTargetSchema);
