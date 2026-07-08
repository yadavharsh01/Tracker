const express = require("express");
const Topic = require("../models/Topic");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const SECTIONS = ["QA", "VARC", "DILR"];

// A reasonable default topic list per section — seeded once per user,
// not hardcoded forever: users can still add their own on top of this.
const DEFAULT_TOPICS = {
  QA: ["Number Systems", "Algebra", "Arithmetic", "Geometry & Mensuration", "Modern Math (P&C, Probability)"],
  VARC: ["Reading Comprehension", "Para-jumbles & Summary", "Vocabulary & Verbal Reasoning"],
  DILR: ["Data Interpretation (Tables & Charts)", "Logical Reasoning (Games & Tournaments)", "Data Sufficiency", "Puzzles & Arrangements"],
};

// SEED — idempotent. Only inserts topics the user doesn't already have.
router.post("/seed", auth, async (req, res) => {
  try {
    const existing = await Topic.find({ userId: req.user.id });
    const existingKeys = new Set(existing.map((t) => `${t.section}::${t.name}`));

    const toInsert = [];
    for (const section of SECTIONS) {
      for (const name of DEFAULT_TOPICS[section]) {
        const key = `${section}::${name}`;
        if (!existingKeys.has(key)) {
          toInsert.push({ userId: req.user.id, section, name });
        }
      }
    }

    if (toInsert.length > 0) {
      await Topic.insertMany(toInsert);
    }

    const topics = await Topic.find({ userId: req.user.id }).sort({ section: 1, name: 1 });
    res.json(topics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// LIST
router.get("/", auth, async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.user.id }).sort({ section: 1, name: 1 });
    res.json(topics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DUE FOR REVISION — topics you've started learning but haven't revisited in 14+ days
// (or never revisited at all). Not started topics don't need "revision" yet.
router.get("/due", auth, async (req, res) => {
  try {
    const topics = await Topic.find({
      userId: req.user.id,
      mastery: { $in: ["learning", "mastered"] },
    });

    const REVISION_INTERVAL_DAYS = 14;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - REVISION_INTERVAL_DAYS);

    const due = topics
      .filter((t) => !t.lastRevisedAt || new Date(t.lastRevisedAt) < cutoff)
      .sort((a, b) => {
        const aTime = a.lastRevisedAt ? new Date(a.lastRevisedAt).getTime() : 0;
        const bTime = b.lastRevisedAt ? new Date(b.lastRevisedAt).getTime() : 0;
        return aTime - bTime; // most overdue (or never revised) first
      });

    res.json(due);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ADD a custom topic
router.post("/", auth, async (req, res) => {
  const { section, name } = req.body;

  if (!SECTIONS.includes(section)) {
    return res.status(400).json({ msg: "Section must be QA, VARC, or DILR" });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ msg: "Topic name is required" });
  }

  try {
    const topic = new Topic({ userId: req.user.id, section, name: name.trim() });
    await topic.save();
    res.status(201).json(topic);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: "You already have a topic with this name in this section" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE mastery level
router.put("/:id", auth, async (req, res) => {
  const { mastery } = req.body;

  if (!["not_started", "learning", "mastered"].includes(mastery)) {
    return res.status(400).json({ msg: "Invalid mastery level" });
  }

  try {
    // Moving into "learning" or "mastered" counts as touching the topic,
    // so it resets the revision clock — no need to separately hit "revise"
    // right after you've just studied it.
    const update = { mastery };
    if (mastery !== "not_started") {
      update.lastRevisedAt = new Date();
    }

    const topic = await Topic.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true }
    );
    if (!topic) return res.status(404).json({ msg: "Topic not found" });
    res.json(topic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// MARK AS REVISED — resets the revision clock without changing mastery
router.put("/:id/revise", auth, async (req, res) => {
  try {
    const topic = await Topic.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { lastRevisedAt: new Date() },
      { new: true }
    );
    if (!topic) return res.status(404).json({ msg: "Topic not found" });
    res.json(topic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await Topic.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ msg: "Topic not found" });
    res.json({ msg: "Topic deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
