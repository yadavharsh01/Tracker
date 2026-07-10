const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// LEADERBOARD — only users who've opted in, ranked by streak then total hours.
// Deliberately excludes email and any other identifying/private field.
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ leaderboardOptIn: true })
      .select("name streak level totalHours xp")
      .sort({ streak: -1, totalHours: -1 })
      .limit(100);

    const board = users.map((u, i) => ({
      rank: i + 1,
      isMe: String(u._id) === req.user.id,
      name: u.name,
      streak: u.streak,
      level: u.level,
      totalHours: u.totalHours,
    }));

    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
