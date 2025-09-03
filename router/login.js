const express = require("express");
const router = express.Router();
const mysql = require("../mysql2"); // mysql2 with promise
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "08t16e502526fesanfjh8nasd2";

// Login API
router.post("/", async (req, res) => {
  const { mobile_no, password } = req.body;

  if (!mobile_no || !password) {
    return res
      .status(400)
      .json({ message: "Mobile number and password are required" });
  }

  try {
    // Fetch user by mobile_no
    const [rows] = await mysql.query(
      "SELECT * FROM satname_registration WHERE mobile_no = ?",
      [mobile_no]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Check password (plain text; ideally use bcrypt)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Check account status
    // if (user.account_status !== "approved") {
    //   return res.status(403).json({
    //     message: "Your account is pending. Please wait for admin approval.",
    //   });
    // }

    // Create JWT token
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      token,
      role: user.role,
      user_id: user.user_id,
      // password: user.password,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
