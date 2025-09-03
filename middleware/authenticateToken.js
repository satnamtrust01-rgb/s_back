const JWT_SECRET = process.env.JWT_SECRET || "08t16e502526fesanfjh8nasd2";

function authenticateToken(req, res, next) {
  // Check Authorization header
  let authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  // If no token in header, check query parameter `token`
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify JWT
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    console.log("Token decoded:", decoded); // Debug
    next();
  });
}

module.exports = authenticateToken;
