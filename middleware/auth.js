const jwt = require("jsonwebtoken");
const config = require("config");

function auth(req, res, next) {
  // Support both x-auth-token and Authorization: Bearer
  let token = req.header("x-auth-token");
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return res.status(401).send("Access Denied: No token provided");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded; 
    console.log("Token decoded:", decoded);
    next();
  } catch (err) {
    console.error("JWT Error:", err);
    res.status(400).send("Invalid Token");
  }
}

module.exports = auth;
