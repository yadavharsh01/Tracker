const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Session = require("../models/Session");
const MockTest = require("../models/MockTest");
const SectionalTest = require("../models/SectionalTest");
const Topic = require("../models/Topic");
const Goal = require("../models/Goal");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      totalHours: user.totalHours,
      streak: user.streak,
      lastActiveDate: user.lastActiveDate,
      xp: user.xp,
      level: user.level,
      examDate: user.examDate,
      targetPercentile: user.targetPercentile,
      leaderboardOptIn: user.leaderboardOptIn
    });

  } catch (err) {
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE PROFILE (name and/or email)
router.put("/profile", auth, async (req, res) => {
  const { name, email, phone } = req.body;

  if (name !== undefined && !name.trim()) {
    return res.status(400).json({ msg: "Name can't be empty" });
  }
  if (email !== undefined && !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ msg: "A valid email is required" });
  }
  if (phone !== undefined && phone !== "" && phone !== null && !/^\+?[1-9]\d{7,14}$/.test(phone.replace(/[\s-]/g, ""))) {
    return res.status(400).json({ msg: "Enter a valid phone number, e.g. +919876543210" });
  }

  try {
    if (email !== undefined) {
      const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existing) return res.status(400).json({ msg: "That email is already in use" });
    }
    if (phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: req.user.id } });
      if (existingPhone) return res.status(400).json({ msg: "That phone number is already in use" });
    }

    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone || null;

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });
    res.json({ name: user.name, email: user.email, phone: user.phone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE ACCOUNT — requires current password, cascades to all owned data
router.delete("/account", auth, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ msg: "Enter your password to confirm account deletion" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });

    const CollegeTarget = require("../models/CollegeTarget");

    await Promise.all([
      Session.deleteMany({ userId: req.user.id }),
      MockTest.deleteMany({ userId: req.user.id }),
      SectionalTest.deleteMany({ userId: req.user.id }),
      Topic.deleteMany({ userId: req.user.id }),
      Goal.deleteMany({ userId: req.user.id }),
      CollegeTarget.deleteMany({ userId: req.user.id }),
      User.findByIdAndDelete(req.user.id),
    ]);

    res.json({ msg: "Account and all associated data have been deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// EXPORT ALL DATA — everything the user has entered, as one JSON payload
router.get("/export", auth, async (req, res) => {
  try {
    const CollegeTarget = require("../models/CollegeTarget");

    const [user, sessions, mockTests, sectionalTests, topics, goals, colleges] = await Promise.all([
      User.findById(req.user.id).select("-password -resetPasswordTokenHash -resetPasswordExpires"),
      Session.find({ userId: req.user.id }),
      MockTest.find({ userId: req.user.id }),
      SectionalTest.find({ userId: req.user.id }),
      Topic.find({ userId: req.user.id }),
      Goal.find({ userId: req.user.id }),
      CollegeTarget.find({ userId: req.user.id }),
    ]);

    res.json({
      exportedAt: new Date(),
      profile: user,
      sessions,
      mockTests,
      sectionalTests,
      topics,
      goals,
      collegeTargets: colleges,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// LEADERBOARD OPT-IN TOGGLE
router.put("/leaderboard-opt-in", auth, async (req, res) => {
  const { optIn } = req.body;
  if (typeof optIn !== "boolean") {
    return res.status(400).json({ msg: "optIn must be true or false" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { leaderboardOptIn: optIn },
      { new: true }
    );
    res.json({ leaderboardOptIn: user.leaderboardOptIn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;