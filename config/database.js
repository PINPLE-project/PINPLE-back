const mysql = require('mysql2/promise');

// 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: '',
    user: '',
    port: '',
    password: '',
    database: ''
});

module.exports = {
    pool: pool
};