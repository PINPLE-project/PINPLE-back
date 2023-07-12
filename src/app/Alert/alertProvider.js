const { pool } = require("../../../config/database");
const alertDao = require("./alertDao");

exports.alertCheck = async function (AlertParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const alertCheckResult = await alertDao.selectSetupAlertForCheck(
    connection,
    AlertParams
  );
  connection.release();

  return alertCheckResult;
};
