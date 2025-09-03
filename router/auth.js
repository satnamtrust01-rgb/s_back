const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../mysql2");



res.json({
  token,
  role: user.role, // 1, 2, 3
  user_id: user.id,
});


module.exports = router;
