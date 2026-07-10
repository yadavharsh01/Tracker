const express = require("express");
const User = require("../models/User");
const LoginEvent = require("../models/LoginEvent");
const Session = require("../models/Session");
const MockTest = require("../models/MockTest");
const SectionalTest = require("../models/SectionalTest");
const Topic = require("../models/Topic");
const Goal = require("../models/Goal");
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Every route here requires both a valid login AND isAdmin — auth runs first
// so an invalid token gets a 401 rather than leaking a 403 "you're not admin"
// to someone who isn't even logged in.
router.use(auth, adminOnly);

// LIST ALL USERS — summary view for the admin user list
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password -resetPasswordTokenHash -resetPasswordExpires");

    // Attach each user's most recent login in one aggregation rather than
    // N+1 queries.
    const lastLogins = await LoginEvent.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$userId", lastLogin: { $first: "$timestamp" } } },
    ]);
    const lastLoginMap = new Map(lastLogins.map((l) => [String(l._id), l.lastLogin]));

    const result = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
      streak: u.streak,
      level: u.level,
      xp: u.xp,
      totalHours: u.totalHours,
      examDate: u.examDate,
      lastActiveDate: u.lastActiveDate,
      lastLogin: lastLoginMap.get(String(u._id)) || null,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// SINGLE USER DETAIL — everything needed to render that user's dashboard, read-only
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -resetPasswordTokenHash -resetPasswordExpires"
    );
    if (!user) return res.status(404).json({ msg: "User not found" });

    const [sessions, mockTestCount, sectionalCount, topics, goals, recentLogins] = await Promise.all([
      Session.find({ userId: user._id }),
      MockTest.countDocuments({ userId: user._id }),
      SectionalTest.countDocuments({ userId: user._id }),
      Topic.find({ userId: user._id }),
      Goal.find({ userId: user._id }),
      LoginEvent.find({ userId: user._id }).sort({ timestamp: -1 }).limit(20),
    ]);

    // Daily minutes, same shape as /api/sessions/stats, for the admin's chart.
    const dailyMinutes = {};
    sessions.forEach((s) => {
      const date = new Date(s.date).toLocaleDateString();
      dailyMinutes[date] = (dailyMinutes[date] || 0) + s.duration;
    });

    const masteredTopics = topics.filter((t) => t.mastery === "mastered").length;

    res.json({
      profile: {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        totalHours: user.totalHours,
        streak: user.streak,
        lastActiveDate: user.lastActiveDate,
        xp: user.xp,
        level: user.level,
        examDate: user.examDate,
        targetPercentile: user.targetPercentile,
      },
      dailyMinutes,
      sessionCount: sessions.length,
      mockTestCount,
      sectionalCount,
      topicCount: topics.length,
      masteredTopics,
      goalCount: goals.length,
      recentLogins,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// LOGIN HISTORY for a single user
router.get("/users/:id/logins", async (req, res) => {
  try {
    const logins = await LoginEvent.find({ userId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GLOBAL LOGIN FEED — recent logins across every user
router.get("/logins", async (req, res) => {
  try {
    const logins = await LoginEvent.find()
      .sort({ timestamp: -1 })
      .limit(200)
      .populate("userId", "name email");
    res.json(logins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
