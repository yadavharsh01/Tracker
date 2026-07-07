const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      name: user.name,
      totalHours: user.totalHours,
      streak: user.streak,
      lastActiveDate: user.lastActiveDate,
      xp: user.xp,
      level: user.level,
      examDate: user.examDate,
      targetPercentile: user.targetPercentile
    });

  } catch (err) {
    res.status(500).send("Server error");
  }
});

// SET EXAM DATE (for the countdown widget)
router.put("/exam-date", auth, async (req, res) => {
  const { examDate } = req.body;

  if (!examDate || Number.isNaN(new Date(examDate).getTime())) {
    return res.status(400).json({ msg: "A valid exam date is required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { examDate: new Date(examDate) },
      { new: true }
    );
    res.json({ examDate: user.examDate });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// SET TARGET PERCENTILE (for the percentile target tracker)
router.put("/target-percentile", auth, async (req, res) => {
  const { targetPercentile } = req.body;
  const value = Number(targetPercentile);

  if (Number.isNaN(value) || value < 0 || value > 100) {
    return res.status(400).json({ msg: "Target percentile must be between 0 and 100" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { targetPercentile: value },
      { new: true }
    );
    res.json({ targetPercentile: user.targetPercentile });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;