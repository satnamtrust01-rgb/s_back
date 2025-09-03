const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Example upload route
router.post("/", upload.single("file"), (req, res) => {
  res.json({ filename: req.file.filename, path: req.file.path });
});

module.exports = router;
