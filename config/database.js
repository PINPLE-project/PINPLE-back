const mysql = require("mysql2/promise");

// 본인의 DB 계정 입력
const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  port: "3306",
  password: "jyjyjy1106@",
  database: "pinple",
});

module.exports = {
  pool: pool,
};
