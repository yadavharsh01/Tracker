const User = require("../models/User");
const { sendPushToUser, isPushConfigured } = require("./push");

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // check hourly, act once/day
const REMINDER_HOUR_LOCAL = 20; // 8 PM server time — see note in DEPLOYMENT.md
let lastRunDate = null;

function isToday(date, reference) {
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

async function runStreakRiskCheck() {
  if (!isPushConfigured()) return;

  const now = new Date();
  const todayKey = now.toDateString();

  if (now.getHours() !== REMINDER_HOUR_LOCAL || lastRunDate === todayKey) return;
  lastRunDate = todayKey;

  try {
    const atRiskUsers = await User.find({ streak: { $gt: 0 } });

    for (const user of atRiskUsers) {
      const studiedToday = user.lastActiveDate && isToday(new Date(user.lastActiveDate), now);
      if (studiedToday) continue;

      await sendPushToUser(user._id, {
        title: "Don't break your streak",
        body: `You haven't logged a session today — your ${user.streak}-day streak is on the line.`,
      });
    }
  } catch (err) {
    console.error("[streak reminder] Check failed:", err);
  }
}

function startStreakReminderScheduler() {
  if (!isPushConfigured()) {
    console.log("[streak reminder] Push not configured — scheduler not started.");
    return;
  }
  setInterval(runStreakRiskCheck, CHECK_INTERVAL_MS);
  console.log(`[streak reminder] Scheduler started — checks hourly, fires at ${REMINDER_HOUR_LOCAL}:00 server time.`);
}

module.exports = { startStreakReminderScheduler };
