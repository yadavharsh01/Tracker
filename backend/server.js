const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Render/most hosts sit behind a reverse proxy — needed so rate-limiting and
// req.ip see the real client IP instead of the proxy's.
app.set("trust proxy", 1);

// CONNECT DB
connectDB();

// MIDDLEWARE
app.use(helmet());

// In production, restrict CORS to your deployed frontend's URL via FRONTEND_URL.
// Left unset (dev), it allows all origins so localhost testing just works.
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((s) => s.trim())
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Basic brute-force protection on auth endpoints — 20 attempts per 15 minutes
// per IP. Generous enough for real users, tight enough to slow down guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: "Too many attempts. Try again in a few minutes." },
});
app.use("/api/auth", authLimiter);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/sessions", require("./routes/sessions"));
app.use("/api/user", require("./routes/user"));
app.use("/api/mocktests", require("./routes/mockTests"));
app.use("/api/sectionaltests", require("./routes/sectionalTests"));
app.use("/api/goals", require("./routes/goals"));
app.use("/api/topics", require("./routes/topics"));
app.use("/api/badges", require("./routes/badges"));
app.use("/api/insights", require("./routes/insights"));

// 404 HANDLER (must come after all routes)
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// CENTRALIZED ERROR HANDLER (must have 4 args to be recognized by Express)
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Don't leak internal error details to clients in production.
  const msg =
    process.env.NODE_ENV === "production" && !err.status
      ? "Server error"
      : err.message || "Server error";
  res.status(err.status || 500).json({ msg });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});