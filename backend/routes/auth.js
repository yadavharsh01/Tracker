const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const LoginEvent = require("../models/LoginEvent");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Sends the password reset email via SMTP. Throws if SMTP isn't configured —
// callers must handle that explicitly rather than silently succeeding without
// actually sending anything.
async function sendResetEmail(email, resetUrl) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    const err = new Error("SMTP not configured");
    err.code = "SMTP_NOT_CONFIGURED";
    throw err;
  }

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to: email,
    subject: "Reset your CAT Prep Tracker password",
    text: `Reset your password here: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
  });
}

// Sends a login OTP by email via SMTP. Same throw-if-unconfigured contract
// as sendResetEmail.
async function sendOtpEmail(email, otp) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    const err = new Error("SMTP not configured");
    err.code = "CHANNEL_NOT_CONFIGURED";
    throw err;
  }

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to: email,
    subject: "Your CAT Prep Tracker login code",
    text: `Your login code is ${otp}. It expires in 10 minutes. If you didn't request this, ignore this message.`,
  });
}

// Sends a login OTP by SMS via Twilio's REST API directly (no SDK needed —
// it's a single authenticated POST, so raw fetch avoids an extra dependency).
async function sendOtpSms(phone, otp) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    const err = new Error("SMS not configured");
    err.code = "CHANNEL_NOT_CONFIGURED";
    throw err;
  }

  const body = new URLSearchParams({
    To: phone,
    From: TWILIO_PHONE_NUMBER,
    Body: `Your CAT Prep Tracker login code is ${otp}. Expires in 10 minutes.`,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Twilio send failed: ${response.status} ${errBody}`);
  }
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^\+?[1-9]\d{7,14}$/; // loose E.164-ish check

function identifierType(identifier) {
  if (EMAIL_RE.test(identifier)) return "email";
  if (PHONE_RE.test(identifier.replace(/[\s-]/g, ""))) return "phone";
  return null;
}

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ msg: "Name is required" });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ msg: "A valid email is required" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ msg: "User registered" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Auto-grant admin access to emails listed in ADMIN_EMAILS (comma-separated).
    // Lightweight bootstrap mechanism — no admin UI needed to create the first
    // admin account.
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (adminEmails.includes(user.email.toLowerCase()) && !user.isAdmin) {
      user.isAdmin = true;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Record the login for admin visibility. Failure here should never block
    // the actual login, so it's fire-and-forget with its own error handling.
    LoginEvent.create({
      userId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || null,
    }).catch((e) => console.error("Failed to record login event:", e));

    res.json({ token, user: { name: user.name, email: user.email, isAdmin: user.isAdmin } });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// FORGOT PASSWORD — request a reset link (emailed only, never returned in the response)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  // Check SMTP config before touching the DB at all — this way the response
  // is identical (503) regardless of whether the email is registered, instead
  // of leaking that distinction through which error path gets hit.
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error(
      "[password reset] SMTP is not configured — cannot send reset emails. " +
        "Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env. See DEPLOYMENT.md."
    );
    return res.status(503).json({
      msg: "Email delivery isn't configured on this server yet. Contact the site admin.",
    });
  }

  // Always return the same generic message whether or not the email exists —
  // prevents leaking which emails are registered.
  const genericResponse = {
    msg: "If that email is registered, a reset link has been sent.",
  };

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json(genericResponse);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    try {
      await sendResetEmail(email, resetUrl);
    } catch (mailErr) {
      console.error("[password reset] Failed to send email:", mailErr);
      // Still return the generic success message — the token was saved, and
      // revealing send failures per-email would leak registration status.
    }

    res.json(genericResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// RESET PASSWORD — consume the token from the emailed link
router.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ msg: "Email, token, and new password are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters" });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email,
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ msg: "That reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ msg: "Password reset. You can log in with your new password now." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// CHANGE PASSWORD — for a logged-in user who knows their current password
router.put("/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: "Current and new password are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ msg: "New password must be at least 6 characters" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// REQUEST LOGIN OTP — accepts an email or phone number, sends a 6-digit code.
// Channel-agnostic: email uses SMTP (same config as password reset), phone
// uses Twilio. Whichever channel isn't configured returns a clear error
// checked BEFORE any DB lookup, so the response never differs based on
// whether the identifier is actually registered.
router.post("/otp/request", async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ msg: "Enter an email or phone number" });

  const type = identifierType(identifier);
  if (!type) {
    return res.status(400).json({ msg: "Enter a valid email address or phone number" });
  }

  if (type === "email") {
    const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error("[otp] SMTP not configured — cannot send email OTPs. See DEPLOYMENT.md.");
      return res.status(503).json({ msg: "Email login isn't configured on this server yet." });
    }
  } else {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error("[otp] Twilio not configured — cannot send SMS OTPs. See DEPLOYMENT.md.");
      return res.status(503).json({ msg: "Phone login isn't configured on this server yet." });
    }
  }

  const genericResponse = {
    msg: `If that ${type === "email" ? "email" : "phone number"} is registered, a code has been sent.`,
  };

  try {
    const query = type === "email" ? { email: identifier } : { phone: identifier };
    const user = await User.findOne(query);
    if (!user) return res.json(genericResponse);

    // Cooldown — don't let someone spam-request codes (and spam-bill the SMS).
    if (user.otpRequestedAt && Date.now() - user.otpRequestedAt.getTime() < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - user.otpRequestedAt.getTime())) / 1000);
      return res.status(429).json({ msg: `Wait ${waitSeconds}s before requesting another code.` });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    user.otpHash = otpHash;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.otpRequestedAt = new Date();
    await user.save();

    try {
      if (type === "email") {
        await sendOtpEmail(identifier, otp);
      } else {
        await sendOtpSms(identifier, otp);
      }
    } catch (sendErr) {
      console.error("[otp] Failed to send code:", sendErr);
      // Still return generic success — don't leak per-identifier send failures.
    }

    res.json(genericResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// VERIFY LOGIN OTP — consumes the code, issues a normal JWT session
router.post("/otp/verify", async (req, res) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp) {
    return res.status(400).json({ msg: "Identifier and code are required" });
  }

  const type = identifierType(identifier);
  if (!type) return res.status(400).json({ msg: "Invalid identifier" });

  try {
    const query = type === "email" ? { email: identifier } : { phone: identifier };
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      ...query,
      otpHash,
      otpExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ msg: "That code is invalid or has expired" });
    }

    user.otpHash = null;
    user.otpExpires = null;
    user.otpRequestedAt = null;

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (adminEmails.includes(user.email.toLowerCase()) && !user.isAdmin) {
      user.isAdmin = true;
    }
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    LoginEvent.create({
      userId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || null,
    }).catch((e) => console.error("Failed to record login event:", e));

    res.json({ token, user: { name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;