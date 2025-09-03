const express = require("express");
const router = express.Router();
const mysql2 = require("../mysql2"); // assumes mysql2 pool/connection wrapper
const multer = require("multer");
const path = require("path");

// ---- Multer storage (ensure folder exists: /upload/profile) ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../upload/profile"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });

// ---- Helpers ----
function generateUserId(name = "USR") {
  const prefix = (name || "USR").substring(0, 3).toUpperCase();
  const random = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
  return `${prefix}${random}`;
}

const ALLOWED_STATUS = new Set(["pending", "approved", "rejected"]);

// ---- Register (explicitly set status 'pending' in backend) ----
router.post("/register", upload.single("image"), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      mobile_no,
      email,
      aadhar_no,
      pan_no,
      password,
      address,
      occupation, // maps to DB column 'occupasion'
      dob, // YYYY-MM-DD
      gender,
    } = req.body;

    // Build image path stored in DB (served statically by app)
    const imagePath = req.file ? `/upload/profile/${req.file.filename}` : null;

    const userId = generateUserId(firstName);

    // IMPORTANT: fix columns order + set join_date + account_status here
    const sql = `
      INSERT INTO satname_registration
      (user_id, first_name, last_name, mobile_no, email, aadhar_no, pan_no, password,
       occupasion, DoB, image, role, gender, address, join_date, account_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'pending')
    `;

    const params = [
      userId,
      firstName,
      lastName,
      mobile_no,
      email,
      aadhar_no,
      pan_no,
      password, 
      occupation, 
      dob, 
      imagePath,
      2, 
      gender,
      address,
    ];

    const [result] = await mysql2.query(sql, params);
    return res.status(201).json({
      message: "User registered successfully",
      userId,
      password, // if you don't want to echo this, remove it
    });
  } catch (err) {
    console.error("Error inserting user:", err);
    return res.status(500).json({ message: "Registration failed", error: err });
  }
});



// List all users WITH search + status filters for Admin table 
router.get("/", async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;

    let sql = `
      SELECT id, user_id, first_name, last_name, mobile_no, email, aadhar_no, pan_no,
             occupasion, DoB, image, role, gender, address, join_date, approve_date, account_status
      FROM satname_registration
      WHERE 1=1
    `;
    const params = [];

    const trimmed = String(search || "").trim();
    if (trimmed) {
      sql += ` AND (user_id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR mobile_no LIKE ?)`;
      const like = `%${trimmed}%`;
      params.push(like, like, like, like);
    }

    const st = String(status || "").toLowerCase();
    if (st && ALLOWED_STATUS.has(st)) {
      sql += ` AND account_status = ?`;
      params.push(st);
    }

    sql += ` ORDER BY id DESC`;

    const [results] = await mysql2.query(sql, params);
    res.status(200).json(results);
  } catch (err) {
    console.error("Fetch failed:", err);
    res.status(500).json({ message: "Fetch failed", error: err });
  }
});

// ---- Approve / Reject a user ----
// PUT /registration/:userId/status  body: { status: 'approved' | 'rejected' }
router.put("/:userId/status", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const normalized = String(status || "").toLowerCase();
    if (!ALLOWED_STATUS.has(normalized) || normalized === "pending") {
      return res
        .status(400)
        .json({ message: "Status must be 'approved' or 'rejected'." });
    }

    // Update status; set approve_date on approve, clear on reject
    const sql = `
      UPDATE satname_registration
      SET account_status = ?,
          approve_date = ${normalized === "approved" ? "CURDATE()" : "NULL"}
      WHERE user_id = ?
    `;
    const [result] = await mysql2.query(sql, [normalized, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // return updated row
    const [rows] = await mysql2.query(
      `SELECT id, user_id, first_name, last_name, mobile_no, email, account_status, join_date, approve_date
       FROM satname_registration WHERE user_id = ?`,
      [userId]
    );

    res.status(200).json({ message: `User ${normalized}`, user: rows[0] });
  } catch (err) {
    console.error("Status update failed:", err);
    res.status(500).json({ message: "Status update failed", error: err });
  }
});

// ---- Get single user (keep last) ----
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [results] = await mysql2.query(
      "SELECT * FROM satname_registration WHERE user_id = ?",
      [userId]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Fetch failed:", err);
    res.status(500).json({ message: "Fetch failed", error: err });
  }
});

module.exports = router;
