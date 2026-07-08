const express = require("express");
const Goal = require("../models/Goal");
const Session = require("../models/Session");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

function getPeriodStart(period) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === "daily") {
    return start;
  }
  if (period === "weekly") {
    const day = start.getDay(); // 0 = Sunday
    const diffToMonday = (day + 6) % 7;
    start.setDate(start.getDate() - diffToMonday);
    return start;
  }
  if (period === "monthly") {
    start.setDate(1);
    return start;
  }
  return start;
}

// SET / UPDATE a target for a period (upsert)
router.post("/", auth, async (req, res) => {
  const { period, targetMinutes } = req.body;

  if (!["daily", "weekly", "monthly"].includes(period)) {
    return res.status(400).json({ msg: "Period must be daily, weekly, or monthly" });
  }
  const target = Number(targetMinutes);
  if (!target || target <= 0) {
    return res.status(400).json({ msg: "Target minutes must be a positive number" });
  }

  try {
    const goal = await Goal.findOneAndUpdate(
      { userId: req.user.id, period },
      { targetMinutes: target },
      { upsert: true, new: true }
    );
    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET progress for all periods the user has set
router.get("/", auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id });
    const sessions = await Session.find({ userId: req.user.id });

    const progress = goals.map((goal) => {
      const periodStart = getPeriodStart(goal.period);
      const achievedMinutes = sessions
        .filter((s) => new Date(s.date) >= periodStart)
        .reduce((sum, s) => sum + s.duration, 0);

      return {
        period: goal.period,
        targetMinutes: goal.targetMinutes,
        achievedMinutes,
        completionPercent: Math.min(100, Math.round((achievedMinutes / goal.targetMinutes) * 100)),
      };
    });

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
