const express = require("express");
const Session = require("../models/Session");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// ADD SESSION
router.post("/add", auth, async (req, res) => {
  const { subject, duration } = req.body;

  const durationNum = Number(duration);
  if (!subject || !subject.trim()) {
    return res.status(400).json({ msg: "Subject is required" });
  }
  if (!duration || Number.isNaN(durationNum) || durationNum <= 0) {
    return res.status(400).json({ msg: "Duration must be a positive number of minutes" });
  }

  try {
    const user = await User.findById(req.user.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayMs = yesterday.getTime();

    const lastDateMs = user.lastActiveDate
      ? new Date(user.lastActiveDate).setHours(0, 0, 0, 0)
      : null;

    // 🔥 STREAK LOGIC
    if (lastDateMs === todayMs) {
      // Already logged a session today — streak unchanged
    } else if (lastDateMs === yesterdayMs) {
      user.streak += 1;
    } else {
      // First session ever, or a gap of 2+ days — restart streak
      user.streak = 1;
    }

    user.lastActiveDate = today;

    // SAVE SESSION
    const session = new Session({
      userId: req.user.id,
      subject: subject.trim(),
      duration: durationNum
    });

    await session.save();

    // UPDATE STATS
    user.totalHours += durationNum / 60;

    // 🏆 XP SYSTEM
    user.xp += durationNum;

    while (user.xp >= user.level * 100) {
      user.level += 1;
    }

    await user.save();

    res.json({ msg: "Session logged", session });

  } catch (err) {
    res.status(500).send("Server error");
  }
});

// 📊 STATS FOR CHART + HEATMAP
router.get("/stats", auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id });

    const daily = {};

    sessions.forEach(s => {
      const date = new Date(s.date).toLocaleDateString();

      if (!daily[date]) daily[date] = 0;
      daily[date] += s.duration;
    });

    res.json(daily);

  } catch (err) {
    res.status(500).send("Server error");
  }
});

// 🥧 TIME UTILIZATION — total minutes grouped by subject
router.get("/by-subject", auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id });

    const bySubject = {};
    sessions.forEach((s) => {
      bySubject[s.subject] = (bySubject[s.subject] || 0) + s.duration;
    });

    const breakdown = Object.entries(bySubject)
      .map(([subject, minutes]) => ({ subject, minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    res.json(breakdown);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 📋 SESSION HISTORY — raw list, optionally filtered by range (used by the planner view)
router.get("/", auth, async (req, res) => {
  try {
    const { range } = req.query; // 'week' | 'month' | undefined (all time)
    const filter = { userId: req.user.id };

    if (range === "week" || range === "month") {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      since.setDate(since.getDate() - (range === "week" ? 6 : 29));
      filter.date = { $gte: since };
    }

    const sessions = await Session.find(filter).sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;