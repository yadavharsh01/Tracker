const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Sends the password reset email if SMTP is configured; otherwise logs the
// reset link to the server console so local/dev use still works without
// setting up an email provider. Mirrors the Gemini API's "optional, degrades
// gracefully" pattern elsewhere in this app.
async function sendResetEmail(email, resetUrl) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log(`[password reset] SMTP not configured. Reset link for ${email}:\n${resetUrl}`);
    return;
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { name: user.name, email: user.email } });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// FORGOT PASSWORD — request a reset link
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

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

    await sendResetEmail(email, resetUrl);

    // In non-production, include the URL directly in the response so this
    // is testable without setting up SMTP.
    if (process.env.NODE_ENV !== "production") {
      return res.json({ ...genericResponse, devResetUrl: resetUrl });
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

module.exports = router;