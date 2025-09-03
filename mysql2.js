var config = require("config");
const mysql = require("mysql2");

var pool = mysql.createPool({
  host: config.get("db.host"),
  user: config.get("db.user"),
  password: config.get("db.password"),
  database: config.get("db.database"),

});

module.exports = pool.promise();
