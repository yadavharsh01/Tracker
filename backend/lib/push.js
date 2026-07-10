const PushSubscription = require("../models/PushSubscription");

function isPushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let configured = false;
function ensureConfigured() {
  if (configured || !isPushConfigured()) return;
  const webpush = require("web-push");
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  configured = true;
}

/**
 * Sends a push notification to every subscription a user has. Returns the
 * number of subscriptions successfully sent to. Automatically prunes
 * subscriptions the browser has revoked (410 Gone / 404) so they don't pile
 * up and keep failing forever.
 */
async function sendPushToUser(userId, { title, body, url = "/dashboard" }) {
  if (!isPushConfigured()) return 0;
  ensureConfigured();
  const webpush = require("web-push");

  const subs = await PushSubscription.find({ userId });
  if (subs.length === 0) return 0;

  const payload = JSON.stringify({ title, body, url });
  let sentCount = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
        sentCount += 1;
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          console.error("Push send failed:", err.message);
        }
      }
    })
  );

  return sentCount;
}

module.exports = { sendPushToUser, isPushConfigured };
