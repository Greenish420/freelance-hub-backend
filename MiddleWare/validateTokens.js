const jwt = require("jsonwebtoken");

const validateTokens = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.id = decoded.id;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = validateTokens;
