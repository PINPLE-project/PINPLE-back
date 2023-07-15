module.exports = {};
const { pool } = require("../../../config/database");

// 사용자 정보 저장
exports.insertUser = async function (areaName, congestionLevel) {
    try {
        const connection = await pool.getConnection();
        await connection.query('INSERT INTO users (areaName, congestionLevel) VALUES (?, ?)', [areaName, congestionLevel]);
        connection.release();
        return true;
    } catch (error) {
        console.error('Error occurred while inserting user:', error);
        return false;
    }
};
