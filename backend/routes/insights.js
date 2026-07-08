const express = require("express");
const MockTest = require("../models/MockTest");
const Topic = require("../models/Topic");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const SECTION_KEYS = ["VARC", "DILR", "QA"];
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// Simple in-memory per-user cooldown so a double-click (or an eager user)
// doesn't fire multiple billed API calls in quick succession. Resets on
// server restart — fine for this purpose, no need to persist it.
const lastCallByUser = new Map();
const COOLDOWN_MS = 60 * 1000;

function buildPrompt({ mockTests, topics, user }) {
  const sectionTotals = {
    VARC: { attempted: 0, correct: 0 },
    DILR: { attempted: 0, correct: 0 },
    QA: { attempted: 0, correct: 0 },
  };

  mockTests.forEach((mt) => {
    SECTION_KEYS.forEach((key) => {
      const s = mt.sections?.[key];
      if (s) {
        sectionTotals[key].attempted += s.questionsAttempted || 0;
        sectionTotals[key].correct += s.correct || 0;
      }
    });
  });

  const sectionSummary = SECTION_KEYS.map((key) => {
    const t = sectionTotals[key];
    const accuracy = t.attempted > 0 ? Math.round((t.correct / t.attempted) * 1000) / 10 : null;
    return `${key}: ${accuracy === null ? "no data yet" : `${accuracy}% accuracy across ${t.attempted} questions`}`;
  }).join("\n");

  const notMastered = topics
    .filter((t) => t.mastery !== "mastered")
    .map((t) => `${t.section} - ${t.name} (${t.mastery.replace("_", " ")})`)
    .join("\n") || "None — everything tracked is mastered.";

  const daysToExam = user.examDate
    ? Math.max(0, Math.round((new Date(user.examDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return `You are a CAT (Common Admission Test, India MBA entrance exam) prep coach.
Based on this student's data, give 3-4 short, specific, actionable recommendations
for what to focus on next. Be direct and encouraging, not generic. Reference their
actual weak areas by name. Keep the whole response under 150 words, plain text,
no markdown headers.

Section accuracy across all mock tests:
${sectionSummary}

Topics not yet mastered:
${notMastered}

Current study streak: ${user.streak} days
${daysToExam !== null ? `Days until CAT: ${daysToExam}` : "Exam date not set."}
`;
}

router.get("/", auth, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      msg: "AI coach isn't configured yet. Add GEMINI_API_KEY to the backend's .env to enable it.",
    });
  }

  const lastCall = lastCallByUser.get(req.user.id);
  if (lastCall && Date.now() - lastCall < COOLDOWN_MS) {
    const waitSeconds = Math.ceil((COOLDOWN_MS - (Date.now() - lastCall)) / 1000);
    return res.status(429).json({ msg: `Give it ${waitSeconds}s before asking again.` });
  }

  try {
    const [mockTests, topics, user] = await Promise.all([
      MockTest.find({ userId: req.user.id }),
      Topic.find({ userId: req.user.id }),
      User.findById(req.user.id),
    ]);

    if (mockTests.length === 0) {
      return res.status(400).json({
        msg: "Log at least one mock test so the coach has something to work with.",
      });
    }

    const prompt = buildPrompt({ mockTests, topics, user });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Gemini API error:", response.status, errBody);

      if (response.status === 429) {
        const isZeroQuota = errBody.includes('"limit": 0') || errBody.includes("limit: 0");
        return res.status(503).json({
          msg: isZeroQuota
            ? "Your Gemini API key has no free-tier quota assigned yet. Check the Billing Tier at aistudio.google.com/apikey, and try linking a Cloud Billing account at console.cloud.google.com/billing — this is a Google-side setup step, not an app bug."
            : "The AI coach hit Google's rate limit. Try again in a minute.",
        });
      }

      return res.status(502).json({ msg: "The AI coach didn't respond. Try again shortly." });
    }

    const data = await response.json();
    const advice = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!advice) {
      return res.status(502).json({ msg: "The AI coach didn't return a usable response." });
    }

    lastCallByUser.set(req.user.id, Date.now());
    res.json({ advice, generatedAt: new Date() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
