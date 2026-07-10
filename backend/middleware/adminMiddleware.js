const User = require("../models/User");

// Chains after the regular auth middleware. Always re-checks the DB rather
// than trusting anything in the JWT, so revoking admin access takes effect
// on the very next request instead of waiting for the token to expire.
module.exports = async function (req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("isAdmin");
    if (!user || !user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
