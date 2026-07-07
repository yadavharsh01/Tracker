const express = require("express");
const MockTest = require("../models/MockTest");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const SECTION_KEYS = ["VARC", "DILR", "QA"];

function validateSections(sections = {}) {
  for (const key of SECTION_KEYS) {
    const s = sections[key];
    if (!s) continue;
    const attempted = Number(s.questionsAttempted) || 0;
    const correct = Number(s.correct) || 0;
    if (correct > attempted) {
      return `${key}: correct answers can't exceed questions attempted`;
    }
  }
  return null;
}

// Adds a derived `accuracy` percentage per section without storing it,
// so it's always consistent with the raw numbers.
function withAccuracy(mockTest) {
  const obj = mockTest.toObject();
  for (const key of SECTION_KEYS) {
    const s = obj.sections?.[key];
    if (s) {
      s.accuracy = s.questionsAttempted > 0 ? Math.round((s.correct / s.questionsAttempted) * 1000) / 10 : 0;
    }
  }
  return obj;
}

// CREATE
router.post("/", auth, async (req, res) => {
  const { name, date, percentile, totalScore, sections } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ msg: "Mock test name is required" });
  }
  const sectionError = validateSections(sections);
  if (sectionError) return res.status(400).json({ msg: sectionError });

  try {
    const mockTest = new MockTest({
      userId: req.user.id,
      name: name.trim(),
      date: date || Date.now(),
      percentile,
      totalScore,
      sections,
    });
    await mockTest.save();
    res.status(201).json(withAccuracy(mockTest));
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// LIST (most recent first)
router.get("/", auth, async (req, res) => {
  try {
    const mockTests = await MockTest.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(mockTests.map(withAccuracy));
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  const { name, date, percentile, totalScore, sections } = req.body;

  const sectionError = validateSections(sections);
  if (sectionError) return res.status(400).json({ msg: sectionError });

  try {
    const mockTest = await MockTest.findOne({ _id: req.params.id, userId: req.user.id });
    if (!mockTest) return res.status(404).json({ msg: "Mock test not found" });

    if (name !== undefined) mockTest.name = name.trim();
    if (date !== undefined) mockTest.date = date;
    if (percentile !== undefined) mockTest.percentile = percentile;
    if (totalScore !== undefined) mockTest.totalScore = totalScore;
    if (sections !== undefined) {
      mockTest.sections = { ...mockTest.sections.toObject(), ...sections };
    }

    await mockTest.save();
    res.json(withAccuracy(mockTest));
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await MockTest.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ msg: "Mock test not found" });
    res.json({ msg: "Mock test deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ANALYSIS — trend + weak/strong section across all mock tests
router.get("/analysis", auth, async (req, res) => {
  try {
    const mockTests = await MockTest.find({ userId: req.user.id }).sort({ date: 1 });

    if (mockTests.length === 0) {
      return res.json({ trend: [], weakestSection: null, strongestSection: null });
    }

    const sectionTotals = { VARC: { attempted: 0, correct: 0 }, DILR: { attempted: 0, correct: 0 }, QA: { attempted: 0, correct: 0 } };

    const trend = mockTests.map((mt) => {
      SECTION_KEYS.forEach((key) => {
        const s = mt.sections?.[key];
        if (s) {
          sectionTotals[key].attempted += s.questionsAttempted || 0;
          sectionTotals[key].correct += s.correct || 0;
        }
      });
      return {
        name: mt.name,
        date: mt.date,
        totalScore: mt.totalScore,
        percentile: mt.percentile,
      };
    });

    const accuracyBySection = SECTION_KEYS.map((key) => ({
      section: key,
      accuracy:
        sectionTotals[key].attempted > 0
          ? Math.round((sectionTotals[key].correct / sectionTotals[key].attempted) * 1000) / 10
          : null,
    })).filter((s) => s.accuracy !== null);

    const sorted = [...accuracyBySection].sort((a, b) => a.accuracy - b.accuracy);

    res.json({
      trend,
      weakestSection: sorted[0] || null,
      strongestSection: sorted[sorted.length - 1] || null,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
