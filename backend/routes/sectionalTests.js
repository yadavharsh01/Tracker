const express = require("express");
const SectionalTest = require("../models/SectionalTest");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const SECTIONS = ["VARC", "DILR", "QA"];

function validateBody(body) {
  const { section, testName, questionsAttempted, correct, timeTaken, score } = body;

  if (!SECTIONS.includes(section)) {
    return "Section must be VARC, DILR, or QA";
  }
  if (!testName || !testName.trim()) {
    return "Test name is required";
  }
  const attempted = Number(questionsAttempted);
  const correctNum = Number(correct);
  if (Number.isNaN(attempted) || attempted < 0) {
    return "Questions attempted must be a non-negative number";
  }
  if (Number.isNaN(correctNum) || correctNum < 0) {
    return "Correct answers must be a non-negative number";
  }
  if (correctNum > attempted) {
    return "Correct answers can't exceed questions attempted";
  }
  if (timeTaken !== undefined && (Number.isNaN(Number(timeTaken)) || Number(timeTaken) < 0)) {
    return "Time taken must be a non-negative number";
  }
  if (score !== undefined && Number.isNaN(Number(score))) {
    return "Score must be a number";
  }
  return null;
}

// LIST — optionally filtered by section (?section=VARC)
router.get("/", auth, async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.section && SECTIONS.includes(req.query.section)) {
      filter.section = req.query.section;
    }
    const tests = await SectionalTest.find(filter).sort({ date: -1 });
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ANALYSIS — per-section trend (score + accuracy over time) and best score
router.get("/analysis", auth, async (req, res) => {
  try {
    const tests = await SectionalTest.find({ userId: req.user.id }).sort({ date: 1 });

    const bySection = {};
    SECTIONS.forEach((s) => {
      bySection[s] = { trend: [], best: null, totalAttempted: 0, totalCorrect: 0 };
    });

    tests.forEach((t) => {
      const accuracy =
        t.questionsAttempted > 0 ? Math.round((t.correct / t.questionsAttempted) * 1000) / 10 : 0;

      bySection[t.section].trend.push({
        date: t.date,
        score: t.score,
        accuracy,
      });
      bySection[t.section].totalAttempted += t.questionsAttempted;
      bySection[t.section].totalCorrect += t.correct;

      if (bySection[t.section].best === null || t.score > bySection[t.section].best) {
        bySection[t.section].best = t.score;
      }
    });

    SECTIONS.forEach((s) => {
      const b = bySection[s];
      b.overallAccuracy =
        b.totalAttempted > 0 ? Math.round((b.totalCorrect / b.totalAttempted) * 1000) / 10 : null;
    });

    res.json(bySection);
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
    const test = new SectionalTest({
      userId: req.user.id,
      section: req.body.section,
      testName: req.body.testName.trim(),
      date: req.body.date || Date.now(),
      questionsAttempted: Number(req.body.questionsAttempted),
      correct: Number(req.body.correct),
      timeTaken: Number(req.body.timeTaken) || 0,
      score: Number(req.body.score) || 0,
    });
    await test.save();
    res.status(201).json(test);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  const error = validateBody(req.body);
  if (error) return res.status(400).json({ msg: error });

  try {
    const test = await SectionalTest.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        section: req.body.section,
        testName: req.body.testName.trim(),
        date: req.body.date || Date.now(),
        questionsAttempted: Number(req.body.questionsAttempted),
        correct: Number(req.body.correct),
        timeTaken: Number(req.body.timeTaken) || 0,
        score: Number(req.body.score) || 0,
      },
      { new: true }
    );
    if (!test) return res.status(404).json({ msg: "Sectional test not found" });
    res.json(test);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await SectionalTest.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ msg: "Sectional test not found" });
    res.json({ msg: "Sectional test deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
