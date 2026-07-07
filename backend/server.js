const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// CONNECT DB
connectDB();

// MIDDLEWARE
// In production, restrict CORS to your deployed frontend's URL via FRONTEND_URL.
// Left unset (dev), it allows all origins so localhost testing just works.
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((s) => s.trim())
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/sessions", require("./routes/sessions"));
app.use("/api/user", require("./routes/user"));
app.use("/api/mocktests", require("./routes/mockTests"));
app.use("/api/goals", require("./routes/goals"));
app.use("/api/topics", require("./routes/topics"));
app.use("/api/badges", require("./routes/badges"));

// 404 HANDLER (must come after all routes)
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// CENTRALIZED ERROR HANDLER (must have 4 args to be recognized by Express)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ msg: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});