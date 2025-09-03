const express = require("express");
const router = express.Router();
const mysql = require("mysql2");


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "surya@54321",
  database: "Emp_DB",
});

// Define the /api/statistics route
router.get("/api/statistics", (req, res) => {
  res.json({
    
  });
});

module.exports = router;
