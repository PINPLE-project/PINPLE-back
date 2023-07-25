const { pool } = require("../../../config/database");
const reportDao = require("./reportDao");

exports.reportCheck = async function (userId, pinviewId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const reportCheckResult = await reportDao.selectReportForCheck(
    connection,
    userId,
    pinviewId
  );
  connection.release();

  return reportCheckResult;
};
