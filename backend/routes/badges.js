const express = require("express");
const User = require("../models/User");
const MockTest = require("../models/MockTest");
const Topic = require("../models/Topic");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Badges are computed live from existing data rather than stored and
// manually awarded — there's nothing to keep in sync, and no route can
// forget to "grant" one. A badge is just a predicate over data we already have.
const SECTIONS = ["QA", "VARC", "DILR"];

function buildBadges({ user, mockTestCount, topics }) {
  const masteredCount = topics.filter((t) => t.mastery === "mastered").length;
  const sectionFullyMastered = SECTIONS.some((section) => {
    const sectionTopics = topics.filter((t) => t.section === section);
    return sectionTopics.length > 0 && sectionTopics.every((t) => t.mastery === "mastered");
  });

  return [
    {
      id: "first_session",
      name: "First Steps",
      description: "Log your first study session",
      earned: user.totalHours > 0,
    },
    {
      id: "week_streak",
      name: "Week Warrior",
      description: "Hit a 7-day study streak",
      earned: user.streak >= 7,
    },
    {
      id: "month_streak",
      name: "Month Master",
      description: "Hit a 30-day study streak",
      earned: user.streak >= 30,
    },
    {
      id: "century_hours",
      name: "Century Club",
      description: "Log 100 total hours of study",
      earned: user.totalHours >= 100,
    },
    {
      id: "first_mock",
      name: "First Mock",
      description: "Complete your first mock test",
      earned: mockTestCount >= 1,
    },
    {
      id: "mock_veteran",
      name: "Mock Veteran",
      description: "Complete 10 mock tests",
      earned: mockTestCount >= 10,
    },
    {
      id: "first_topic_mastered",
      name: "Topic Master",
      description: "Mark your first topic as mastered",
      earned: masteredCount >= 1,
    },
    {
      id: "section_specialist",
      name: "Section Specialist",
      description: "Master every topic in one section",
      earned: sectionFullyMastered,
    },
    {
      id: "level_5",
      name: "Level 5",
      description: "Reach level 5",
      earned: user.level >= 5,
    },
    {
      id: "level_10",
      name: "Level 10",
      description: "Reach level 10",
      earned: user.level >= 10,
    },
  ];
}

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const [mockTestCount, topics] = await Promise.all([
      MockTest.countDocuments({ userId: req.user.id }),
      Topic.find({ userId: req.user.id }),
    ]);

    const badges = buildBadges({ user, mockTestCount, topics });
    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
