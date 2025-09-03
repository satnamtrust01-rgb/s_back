const express = require("express");
const router = express.Router();
const mysql = require("../mysql");
const auth = require("../middleware/auth");



//  GET ALL USERS 
router.get("/all-users", auth, async (req, res) => {
  try {
    const [rows] = await mysql.query(`
      SELECT id, user_id, first_name, last_name, email, mobile_no, image, account_status 
      FROM satname_registration 
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


//  APPROVE OR REJECT USER 
router.put("/update-status/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["approved", "pending", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await mysql.query(
      "UPDATE satname_registration SET account_status = ? WHERE id = ?",
      [status, id]
    );

    res.json({ message: "Account status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


module.exports = router;
