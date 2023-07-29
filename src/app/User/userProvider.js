const { pool } = require("../../../config/database");
const userDao = require("./userDao");

exports.idCheck = async function(id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const idCheckResult = await userDao.selectUserId(connection, id);
    connection.release();
  
    return idCheckResult;
}