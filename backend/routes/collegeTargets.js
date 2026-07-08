const express = require("express");
const CollegeTarget = require("../models/CollegeTarget");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const STATUSES = ["targeting", "shortlisted", "wat_pi_scheduled", "selected", "waitlisted", "rejected"];

function validateBody(body, { partial = false } = {}) {
  const { collegeName, status, cutoffPercentile, watPiDate } = body;

  if (!partial || collegeName !== undefined) {
    if (!collegeName || !collegeName.trim()) return "College name is required";
  }
  if (status !== undefined && !STATUSES.includes(status)) {
    return "Invalid status";
  }
  if (
    cutoffPercentile !== undefined &&
    cutoffPercentile !== null &&
    cutoffPercentile !== "" &&
    (Number.isNaN(Number(cutoffPercentile)) || Number(cutoffPercentile) < 0 || Number(cutoffPercentile) > 100)
  ) {
    return "Cutoff percentile must be between 0 and 100";
  }
  if (watPiDate !== undefined && watPiDate !== null && watPiDate !== "" && Number.isNaN(new Date(watPiDate).getTime())) {
    return "Invalid WAT-PI date";
  }
  return null;
}

// LIST — sorted by nearest WAT-PI date first, then by creation order
router.get("/", auth, async (req, res) => {
  try {
    const targets = await CollegeTarget.find({ userId: req.user.id }).sort({
      watPiDate: 1,
      createdAt: 1,
    });
    res.json(targets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ADD
router.post("/", auth, async (req, res) => {
  const error = validateBody(req.body);
  if (error) return res.status(400).json({ msg: error });

  try {
    const target = new CollegeTarget({
      userId: req.user.id,
      collegeName: req.body.collegeName.trim(),
      status: req.body.status || "targeting",
      cutoffPercentile:
        req.body.cutoffPercentile === "" || req.body.cutoffPercentile == null
          ? null
          : Number(req.body.cutoffPercentile),
      watPiDate: req.body.watPiDate ? new Date(req.body.watPiDate) : null,
      notes: req.body.notes?.trim() || "",
    });
    await target.save();
    res.status(201).json(target);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE (partial — used for quick status changes too)
router.put("/:id", auth, async (req, res) => {
  const error = validateBody(req.body, { partial: true });
  if (error) return res.status(400).json({ msg: error });

  const update = {};
  if (req.body.collegeName !== undefined) update.collegeName = req.body.collegeName.trim();
  if (req.body.status !== undefined) update.status = req.body.status;
  if (req.body.cutoffPercentile !== undefined) {
    update.cutoffPercentile =
      req.body.cutoffPercentile === "" || req.body.cutoffPercentile == null
        ? null
        : Number(req.body.cutoffPercentile);
  }
  if (req.body.watPiDate !== undefined) {
    update.watPiDate = req.body.watPiDate ? new Date(req.body.watPiDate) : null;
  }
  if (req.body.notes !== undefined) update.notes = req.body.notes.trim();

  try {
    const target = await CollegeTarget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true }
    );
    if (!target) return res.status(404).json({ msg: "College target not found" });
    res.json(target);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await CollegeTarget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ msg: "College target not found" });
    res.json({ msg: "College target deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
