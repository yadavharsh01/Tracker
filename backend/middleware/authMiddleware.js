const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const header = req.headers["authorization"];

  if (!header) return res.status(401).json({ msg: "No token, authorization denied" });

  // Support both "Bearer <token>" (standard) and a raw token (legacy client)
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};