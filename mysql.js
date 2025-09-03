const mysql = require("mysql2/promise");
var config = require("config");

var pool = mysql.createPool({
  host: config.get("db.host"),
  user: config.get("db.user"),
  password: config.get("db.password"),
  database: config.get("db.database"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
