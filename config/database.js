const mysql = require('mysql2/promise');

// 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: 'localhost',
    user: 'moonyaeyoon',
    port: '3306',
    password: 'm072715!',
    database: 'citydata'
});

module.exports = {
    pool: pool
};