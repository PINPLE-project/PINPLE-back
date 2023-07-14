const mysql = require('mysql2/promise');

// 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: 'localhost',
    user: 'moonyaeyoon',
    port: '3000',
    password: 'yaeyoon1004!',
    database: ''
});

module.exports = {
    pool: pool
};