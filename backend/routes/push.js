const express = require("express");
const PushSubscription = require("../models/PushSubscription");
const auth = require("../middleware/authMiddleware");
const { sendPushToUser, isPushConfigured } = require("../lib/push");

const router = express.Router();

// PUBLIC KEY — frontend needs this to subscribe via the browser's Push API
router.get("/public-key", (req, res) => {
  if (!isPushConfigured()) {
    return res.status(503).json({ msg: "Push notifications aren't configured on this server." });
  }
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// SUBSCRIBE — save (or update) this browser's push subscription
router.post("/subscribe", auth, async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ msg: "Invalid subscription payload" });
  }

  try {
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { userId: req.user.id, endpoint, keys },
      { upsert: true, new: true }
    );
    res.status(201).json({ msg: "Subscribed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// UNSUBSCRIBE
router.post("/unsubscribe", auth, async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ msg: "Endpoint is required" });

  try {
    await PushSubscription.deleteOne({ endpoint, userId: req.user.id });
    res.json({ msg: "Unsubscribed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// TEST — send a real push to every subscription this user has, so Settings
// can offer a "send me a test notification" button
router.post("/test", auth, async (req, res) => {
  if (!isPushConfigured()) {
    return res.status(503).json({ msg: "Push notifications aren't configured on this server." });
  }

  try {
    const sent = await sendPushToUser(req.user.id, {
      title: "Test notification",
      body: "Push notifications are working.",
    });
    if (sent === 0) {
      return res.status(400).json({ msg: "No active subscription found. Enable notifications first." });
    }
    res.json({ msg: "Test notification sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
