const express = require("express");
const router = express.Router();
const mysql = require("../mysql2"); // mysql2 with promise
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");



// Dashboard API
router.get("/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  try {
    if (req.user.role === "1" || req.user.role === 1) {
      // Admin → Fetch all users
      const [users] = await mysql.query("SELECT * FROM satname_registration");
      return res.json({ users });
    } else {
      // Normal user → Fetch only their own details + payments
      const [userRows] = await mysql.query(
        "SELECT * FROM satname_registration WHERE user_id = ?",
        [req.user.user_id]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = userRows[0];

      const [paymentRows] = await mysql.query(
        "SELECT * FROM trust_payments WHERE empId = ? ORDER BY payment_date DESC",
        [req.user.user_id]
      );

      return res.json({
        user,
        payments: paymentRows,
      });
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
